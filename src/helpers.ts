import type {
  AreaRegistryEntry,
  EntityRegistryDisplayEntry,
  FloorRegistryEntry,
  HassEntityState,
  HomeAssistant,
} from "./types";

export const UNASSIGNED = "__unassigned__";

export const computeDomain = (entityId: string): string => entityId.split(".")[0];

export const areaPath = (areaId: string): string => `area-${areaId}`;

/** Bereich einer Entität: eigener Bereich, sonst der des Geräts. */
export function getEntityAreaId(
  hass: HomeAssistant,
  entry: EntityRegistryDisplayEntry,
): string | undefined {
  if (entry.area_id) return entry.area_id;
  if (entry.device_id) return hass.devices[entry.device_id]?.area_id ?? undefined;
  return undefined;
}

/** Alle anzeigbaren Entitäten (nicht versteckt, keine Konfig-/Diagnose-Entitäten). */
export function getVisibleEntities(
  hass: HomeAssistant,
  hiddenEntities: string[] = [],
): EntityRegistryDisplayEntry[] {
  const hidden = new Set(hiddenEntities);
  return Object.values(hass.entities).filter(
    (e) =>
      !e.hidden &&
      !e.entity_category &&
      !hidden.has(e.entity_id) &&
      e.entity_id in hass.states,
  );
}

export function groupByArea(
  hass: HomeAssistant,
  entries: EntityRegistryDisplayEntry[],
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const entry of entries) {
    const key = getEntityAreaId(hass, entry) ?? UNASSIGNED;
    const list = map.get(key);
    if (list) list.push(entry.entity_id);
    else map.set(key, [entry.entity_id]);
  }
  return map;
}

export const friendlyName = (hass: HomeAssistant, entityId: string): string =>
  String(hass.states[entityId]?.attributes.friendly_name ?? entityId);

export function sortByName(hass: HomeAssistant, ids: string[]): string[] {
  return [...ids].sort((a, b) =>
    friendlyName(hass, a).localeCompare(friendlyName(hass, b), hass.language),
  );
}

export function getSortedAreas(
  hass: HomeAssistant,
  order: string[] = [],
  hiddenAreas: string[] = [],
): AreaRegistryEntry[] {
  const hidden = new Set(hiddenAreas);
  return Object.values(hass.areas)
    .filter((a) => !hidden.has(a.area_id))
    .sort((a, b) => {
      const ia = order.indexOf(a.area_id);
      const ib = order.indexOf(b.area_id);
      if (ia !== -1 || ib !== -1) {
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      }
      return a.name.localeCompare(b.name, hass.language);
    });
}

export interface FloorGroup {
  floor?: FloorRegistryEntry;
  areas: AreaRegistryEntry[];
}

/** Gruppiert (bereits sortierte) Bereiche nach Etage; Etagen nach Level sortiert. */
export function groupAreasByFloor(
  hass: HomeAssistant,
  areas: AreaRegistryEntry[],
): FloorGroup[] {
  const floors = Object.values(hass.floors ?? {}).sort(
    (a, b) =>
      (a.level ?? Number.MAX_SAFE_INTEGER) - (b.level ?? Number.MAX_SAFE_INTEGER) ||
      a.name.localeCompare(b.name, hass.language),
  );
  const groups: FloorGroup[] = floors.map((floor) => ({
    floor,
    areas: areas.filter((a) => a.floor_id === floor.floor_id),
  }));
  const known = new Set(floors.map((f) => f.floor_id));
  groups.push({ areas: areas.filter((a) => !a.floor_id || !known.has(a.floor_id)) });
  return groups.filter((g) => g.areas.length > 0);
}

export function isDimmable(state: HassEntityState | undefined): boolean {
  const modes = state?.attributes.supported_color_modes as string[] | undefined;
  return Array.isArray(modes) && modes.some((m) => m !== "onoff");
}
