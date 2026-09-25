import { areaPath, computeDomain, isDimmable } from "./helpers";
import type { AreaRegistryEntry, HomeAssistant, LovelaceCardConfig } from "./types";

export function headingCard(
  heading: string,
  icon?: string | null,
  navigationPath?: string,
): LovelaceCardConfig {
  const card: LovelaceCardConfig = { type: "heading", heading };
  if (icon) card.icon = icon;
  if (navigationPath) {
    card.tap_action = { action: "navigate", navigation_path: navigationPath };
  }
  return card;
}

export function areaCard(area: AreaRegistryEntry, navigate = true): LovelaceCardConfig {
  const card: LovelaceCardConfig = {
    type: "area",
    area: area.area_id,
    display_type: area.picture ? "picture" : "compact",
    grid_options: { columns: 6 },
  };
  if (navigate) card.navigation_path = areaPath(area.area_id);
  return card;
}

export function lightTile(hass: HomeAssistant, entityId: string): LovelaceCardConfig {
  const card: LovelaceCardConfig = { type: "tile", entity: entityId };
  if (isDimmable(hass.states[entityId])) card.features = [{ type: "light-brightness" }];
  return card;
}

export function allOffButton(label: string, confirm: string, lights: string[]): LovelaceCardConfig {
  return {
    type: "button",
    name: label,
    icon: "mdi:lightbulb-group-off",
    show_state: false,
    grid_options: { columns: 6, rows: 1 },
    tap_action: {
      action: "perform-action",
      perform_action: "homeassistant.turn_off",
      target: { entity_id: lights },
      confirmation: { text: confirm },
    },
  };
}

export function markdownCard(content: string): LovelaceCardConfig {
  return { type: "markdown", content };
}

/** Passende Karte je Domain für die Bereichs-Detailansicht. */
export function entityCard(hass: HomeAssistant, entityId: string): LovelaceCardConfig {
  switch (computeDomain(entityId)) {
    case "light":
      return lightTile(hass, entityId);
    case "cover":
      return { type: "tile", entity: entityId, features: [{ type: "cover-open-close" }] };
    case "fan":
      return { type: "tile", entity: entityId, features: [{ type: "fan-speed" }] };
    case "climate":
    case "water_heater":
      return { type: "tile", entity: entityId, features: [{ type: "target-temperature" }] };
    case "media_player":
      return { type: "media-control", entity: entityId };
    case "camera":
      return {
        type: "picture-entity",
        entity: entityId,
        camera_view: "auto",
        show_state: false,
      };
    default:
      return { type: "tile", entity: entityId };
  }
}
