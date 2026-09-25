import type { HomeAssistant } from "./types";

const en = {
  overview: "Overview",
  areas: "Areas",
  lights: "Lights",
  unassigned: "Without area",
  other_areas: "More areas",
  no_floor: "Without floor",
  all_off: "All lights off",
  all_off_confirm: "Turn off all lights?",
  no_lights: "No lights found.",
  no_entities: "No devices assigned to this area.",
  area_not_found: "Area not found",
  group_light: "Lights",
  group_switch: "Switches",
  group_fan: "Fans",
  group_cover: "Covers",
  group_climate: "Climate",
  group_media: "Media",
  group_lock: "Locks",
  group_vacuum: "Vacuums",
  group_camera: "Cameras",
  group_sensor: "Sensors",
  group_binary_sensor: "Status",
  group_other: "Other",
};

export type StringKey = keyof typeof en;

const de: Record<StringKey, string> = {
  overview: "Übersicht",
  areas: "Bereiche",
  lights: "Beleuchtung",
  unassigned: "Ohne Bereich",
  other_areas: "Weitere Bereiche",
  no_floor: "Ohne Etage",
  all_off: "Alle Lampen aus",
  all_off_confirm: "Alle Lampen ausschalten?",
  no_lights: "Keine Lampen gefunden.",
  no_entities: "Diesem Bereich sind keine Geräte zugeordnet.",
  area_not_found: "Bereich nicht gefunden",
  group_light: "Beleuchtung",
  group_switch: "Schalter",
  group_fan: "Ventilatoren",
  group_cover: "Rollläden & Abdeckungen",
  group_climate: "Klima",
  group_media: "Medien",
  group_lock: "Schlösser",
  group_vacuum: "Staubsauger",
  group_camera: "Kameras",
  group_sensor: "Sensoren",
  group_binary_sensor: "Status",
  group_other: "Sonstiges",
};

const TABLES: Record<string, Record<StringKey, string>> = { en, de };

export function getTranslator(hass: HomeAssistant): (key: StringKey) => string {
  const lang = (hass.locale?.language ?? hass.language ?? "en").split("-")[0];
  const table = TABLES[lang] ?? en;
  return (key) => table[key] ?? en[key];
}
