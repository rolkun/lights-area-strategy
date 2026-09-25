import { areaCard, entityCard, headingCard, markdownCard } from "./cards";
import {
  areaPath,
  computeDomain,
  getEntityAreaId,
  getVisibleEntities,
  sortByName,
} from "./helpers";
import { getTranslator, type StringKey } from "./localize";
import type {
  AreaViewStrategyConfig,
  HomeAssistant,
  LovelaceSectionConfig,
  LovelaceViewConfig,
} from "./types";

type GroupKey =
  | "light" | "switch" | "fan" | "cover" | "climate" | "media" | "lock"
  | "vacuum" | "camera" | "sensor" | "binary_sensor" | "other";

const GROUPS: { key: GroupKey; icon: string }[] = [
  { key: "light", icon: "mdi:lightbulb-group" },
  { key: "cover", icon: "mdi:window-shutter" },
  { key: "climate", icon: "mdi:thermostat" },
  { key: "switch", icon: "mdi:toggle-switch" },
  { key: "fan", icon: "mdi:fan" },
  { key: "media", icon: "mdi:speaker" },
  { key: "lock", icon: "mdi:lock" },
  { key: "vacuum", icon: "mdi:robot-vacuum" },
  { key: "camera", icon: "mdi:cctv" },
  { key: "binary_sensor", icon: "mdi:checkbox-marked-circle-outline" },
  { key: "sensor", icon: "mdi:gauge" },
  { key: "other", icon: "mdi:dots-horizontal-circle" },
];

const DOMAIN_TO_GROUP: Record<string, GroupKey> = {
  light: "light",
  switch: "switch",
  input_boolean: "switch",
  fan: "fan",
  cover: "cover",
  climate: "climate",
  humidifier: "climate",
  water_heater: "climate",
  media_player: "media",
  lock: "lock",
  vacuum: "vacuum",
  lawn_mower: "vacuum",
  camera: "camera",
  sensor: "sensor",
  binary_sensor: "binary_sensor",
};

export class LightsAreaViewStrategy extends HTMLElement {
  static async generate(
    config: AreaViewStrategyConfig,
    hass: HomeAssistant,
  ): Promise<LovelaceViewConfig> {
    const t = getTranslator(hass);
    const area = hass.areas[config.area_id];

    if (!area) {
      return {
        type: "sections",
        subview: true,
        sections: [{ type: "grid", cards: [markdownCard(`${t("area_not_found")}: ${config.area_id}`)] }],
      };
    }

    const ids = getVisibleEntities(hass, config.hidden_entities)
      .filter((e) => getEntityAreaId(hass, e) === area.area_id)
      .map((e) => e.entity_id);

    const grouped = new Map<GroupKey, string[]>();
    for (const id of ids) {
      const key = DOMAIN_TO_GROUP[computeDomain(id)] ?? "other";
      grouped.set(key, [...(grouped.get(key) ?? []), id]);
    }

    const sections: LovelaceSectionConfig[] = [
      { type: "grid", cards: [{ ...areaCard(area, false), grid_options: { columns: 12 } }] },
    ];

    for (const { key, icon } of GROUPS) {
      const list = grouped.get(key);
      if (!list?.length) continue;
      sections.push({
        type: "grid",
        cards: [
          headingCard(t(`group_${key}` as StringKey), icon),
          ...sortByName(hass, list).map((id) => entityCard(hass, id)),
        ],
      });
    }

    if (sections.length === 1) sections[0].cards.push(markdownCard(t("no_entities")));

    return {
      title: area.name,
      path: areaPath(area.area_id),
      subview: true,
      type: "sections",
      max_columns: 4,
      sections,
    };
  }
}
