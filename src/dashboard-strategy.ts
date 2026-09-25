import { allOffButton, areaCard, headingCard, lightTile, markdownCard } from "./cards";
import {
  UNASSIGNED,
  areaPath,
  computeDomain,
  getSortedAreas,
  getVisibleEntities,
  groupAreasByFloor,
  groupByArea,
  sortByName,
} from "./helpers";
import { getTranslator } from "./localize";
import type {
  AreaRegistryEntry,
  DashboardStrategyConfig,
  HomeAssistant,
  LovelaceConfig,
  LovelaceSectionConfig,
  LovelaceViewConfig,
} from "./types";

export const AREA_VIEW_STRATEGY = "custom:lights-area-view";
const MAX_COLUMNS = 4;

export class LightsAreaDashboardStrategy extends HTMLElement {
  static async generate(
    config: DashboardStrategyConfig,
    hass: HomeAssistant,
  ): Promise<LovelaceConfig> {
    const t = getTranslator(hass);
    const byArea = groupByArea(hass, getVisibleEntities(hass, config.hidden_entities));
    const extra = new Set(config.extra_lights ?? []);
    const showAreaCards = config.show_area_cards !== false;

    const areas = getSortedAreas(hass, config.area_order, config.hidden_areas).filter(
      (a) => config.show_empty_areas || (byArea.get(a.area_id)?.length ?? 0) > 0,
    );

    const lightsOf = (key: string): string[] =>
      sortByName(
        hass,
        (byArea.get(key) ?? []).filter((id) => computeDomain(id) === "light" || extra.has(id)),
      );

    const useFloors =
      config.group_by_floor !== false && Object.keys(hass.floors ?? {}).length > 0;
    const groups = useFloors ? groupAreasByFloor(hass, areas) : [{ floor: undefined, areas }];

    const allLights: string[] = [];
    const bodySections: LovelaceSectionConfig[] = [];

    for (const group of groups) {
      const withLights: { area: AreaRegistryEntry; lights: string[] }[] = [];
      const withoutLights: AreaRegistryEntry[] = [];
      for (const area of group.areas) {
        const lights = lightsOf(area.area_id);
        if (lights.length) {
          withLights.push({ area, lights });
          allLights.push(...lights);
        } else {
          withoutLights.push(area);
        }
      }
      if (!withLights.length && (!showAreaCards || !withoutLights.length)) continue;

      // Etagen-Trenner über die volle Breite
      if (useFloors) {
        bodySections.push({
          type: "grid",
          column_span: MAX_COLUMNS,
          cards: [
            headingCard(group.floor?.name ?? t("no_floor"), group.floor?.icon ?? "mdi:home-floor-0"),
          ],
        });
      }

      // Ein Abschnitt je Bereich: Bereichskarte als Kopf, darunter die Lampen
      for (const { area, lights } of withLights) {
        const head = showAreaCards
          ? { ...areaCard(area), grid_options: { columns: 12 } }
          : headingCard(area.name, area.icon ?? "mdi:lightbulb-group", areaPath(area.area_id));
        bodySections.push({
          type: "grid",
          cards: [head, ...lights.map((id) => lightTile(hass, id))],
        });
      }

      // Bereiche ohne Lampen gesammelt, damit man trotzdem hineinnavigieren kann
      if (showAreaCards && withoutLights.length) {
        bodySections.push({
          type: "grid",
          cards: [
            headingCard(t("other_areas"), "mdi:floor-plan"),
            ...withoutLights.map((a) => areaCard(a)),
          ],
        });
      }
    }

    if (config.show_unassigned_lights !== false) {
      const lights = lightsOf(UNASSIGNED);
      if (lights.length) {
        allLights.push(...lights);
        bodySections.push({
          type: "grid",
          cards: [
            headingCard(t("unassigned"), "mdi:lightbulb-question"),
            ...lights.map((id) => lightTile(hass, id)),
          ],
        });
      }
    }

    const header: LovelaceSectionConfig = {
      type: "grid",
      column_span: MAX_COLUMNS,
      cards: [headingCard(t("lights"), "mdi:lightbulb-multiple")],
    };
    if (!allLights.length) {
      header.cards.push(markdownCard(t("no_lights")));
    } else if (config.show_all_off_button !== false) {
      header.cards.push(allOffButton(t("all_off"), t("all_off_confirm"), allLights));
    }

    const mainView: LovelaceViewConfig = {
      title: t("overview"),
      path: "home",
      icon: "mdi:home",
      type: "sections",
      max_columns: MAX_COLUMNS,
      sections: [header, ...bodySections],
    };

    const areaViews: LovelaceViewConfig[] = areas.map((area) => ({
      title: area.name,
      path: areaPath(area.area_id),
      icon: area.icon ?? undefined,
      subview: true,
      strategy: {
        type: AREA_VIEW_STRATEGY,
        area_id: area.area_id,
        hidden_entities: config.hidden_entities ?? [],
      },
    }));

    return { title: config.title, views: [mainView, ...areaViews] };
  }
}
