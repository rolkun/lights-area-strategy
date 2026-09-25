// Minimale Typen der Home-Assistant-Frontend-Objekte, die die Strategie nutzt.

export interface HassEntityState {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
}

export interface EntityRegistryDisplayEntry {
  entity_id: string;
  name?: string;
  icon?: string;
  device_id?: string;
  area_id?: string;
  labels?: string[];
  hidden?: boolean;
  entity_category?: "config" | "diagnostic";
  platform?: string;
}

export interface DeviceRegistryEntry {
  id: string;
  name: string | null;
  name_by_user: string | null;
  area_id: string | null;
}

export interface AreaRegistryEntry {
  area_id: string;
  name: string;
  icon?: string | null;
  picture?: string | null;
  floor_id?: string | null;
}

export interface FloorRegistryEntry {
  floor_id: string;
  name: string;
  level: number | null;
  icon?: string | null;
}

export interface HomeAssistant {
  states: Record<string, HassEntityState>;
  entities: Record<string, EntityRegistryDisplayEntry>;
  devices: Record<string, DeviceRegistryEntry>;
  areas: Record<string, AreaRegistryEntry>;
  floors?: Record<string, FloorRegistryEntry>;
  language: string;
  locale?: { language: string };
}

export interface LovelaceCardConfig {
  type: string;
  [key: string]: unknown;
}

export interface LovelaceSectionConfig {
  type: "grid";
  column_span?: number;
  cards: LovelaceCardConfig[];
}

export interface LovelaceViewConfig {
  title?: string;
  path?: string;
  icon?: string;
  type?: string;
  subview?: boolean;
  max_columns?: number;
  sections?: LovelaceSectionConfig[];
  strategy?: { type: string; [key: string]: unknown };
}

export interface LovelaceConfig {
  title?: string;
  views: LovelaceViewConfig[];
}

/** Optionen unter `strategy:` im Dashboard-YAML. */
export interface DashboardStrategyConfig {
  type: string;
  title?: string;
  /** Bereiche, die komplett ausgeblendet werden. */
  hidden_areas?: string[];
  /** Entitäten, die nirgends angezeigt werden. */
  hidden_entities?: string[];
  /** Feste Reihenfolge von Bereichen (area_id). Nicht gelistete folgen alphabetisch. */
  area_order?: string[];
  /** Bereichskarten nach Etagen gruppieren (Standard: true, falls Etagen existieren). */
  group_by_floor?: boolean;
  /** Bereichskarten auf der Startseite anzeigen (Standard: true). */
  show_area_cards?: boolean;
  /** Lampen ohne Bereich anzeigen (Standard: true). */
  show_unassigned_lights?: boolean;
  /** Button „Alle Lampen aus“ anzeigen (Standard: true). */
  show_all_off_button?: boolean;
  /** Bereiche ohne Entitäten trotzdem anzeigen (Standard: false). */
  show_empty_areas?: boolean;
}

export interface AreaViewStrategyConfig {
  type: string;
  area_id: string;
  hidden_entities?: string[];
}
