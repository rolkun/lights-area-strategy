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
  DashboardStrategyConfig,
  HomeAssistant,
  LovelaceConfig,
  LovelaceSectionConfig,
  LovelaceViewConfig,
} from "./types";

export const AREA_VIEW_STRATEGY = "custom:lights-area-view";

export class LightsAreaDashboardStrategy extends HTMLElement {
  static async generate(
    config: DashboardStrategyConfig,
    hass: HomeAssistant,
  ): Promise<LovelaceConfig> {
    const t = getTranslator(hass);
    const byArea = groupByArea(hass, getVisibleEntities(hass, config.hidden_entities));

    const areas = getSortedAreas(hass, config.area_order, config.hidden_areas).filter(
      (a) => config.show_empty_areas || (byArea.get(a.area_id)?.length ?? 0) > 0,
    );

    const lightsOf = (key: string): string[] =>
      sortByName(hass, (byArea.get(key) ?? []).filter((id) => computeDomain(id) === "light"));

    const sections: LovelaceSectionConfig[] = [];

    // 1) Bereichskarten (optional nach Etagen) – Einstieg in die Detailansichten
    if (config.show_area_cards !== false && areas.length) {
      const useFloors =
        config.group_by_floor !== false && Object.keys(hass.floors ?? {}).length > 0;
      const groups = useFloors
        ? groupAreasByFloor(hass, areas)
        : [{ floor: undefined, areas }];
      for (const group of groups) {
        sections.push({
          type: "grid",
          cards: [
            headingCard(
              group.floor?.name ?? t("areas"),
              group.floor?.icon ?? "mdi:floor-plan",
            ),
            ...group.areas.map((a) => areaCard(a)),
          ],
        });
      }
    }

    // 2) Lampen je Bereich
    const lightSections: LovelaceSectionConfig[] = [];
    const allLights: string[] = [];

    for (const area of areas) {
      const lights = lightsOf(area.area_id);
      if (!lights.length) continue;
      allLights.push(...lights);
      lightSections.push({
        type: "grid",
        cards: [
          headingCard(area.name, area.icon ?? "mdi:lightbulb-group", areaPath(area.area_id)),
          ...lights.map((id) => lightTile(hass, id)),
        ],
      });
    }

    if (config.show_unassigned_lights !== false) {
      const lights = lightsOf(UNASSIGNED);
      if (lights.length) {
        allLights.push(...lights);
        lightSections.push({
          type: "grid",
          cards: [
            headingCard(t("unassigned"), "mdi:lightbulb-question"),
            ...lights.map((id) => lightTile(hass, id)),
          ],
        });
      }
    }

    const lightsHeader: LovelaceSectionConfig = {
      type: "grid",
      cards: [headingCard(t("lights"), "mdi:lightbulb-multiple")],
    };
    if (!allLights.length) {
      lightsHeader.cards.push(markdownCard(t("no_lights")));
    } else if (config.show_all_off_button !== false) {
      lightsHeader.cards.push(allOffButton(t("all_off"), t("all_off_confirm"), allLights));
    }
    sections.push(lightsHeader, ...lightSections);

    const mainView: LovelaceViewConfig = {
      title: t("overview"),
      path: "home",
      icon: "mdi:home",
      type: "sections",
      max_columns: 4,
      sections,
    };

    // 3) Unteransichten je Bereich – werden erst beim Öffnen generiert
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
