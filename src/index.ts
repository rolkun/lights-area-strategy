import { LightsAreaDashboardStrategy } from "./dashboard-strategy";
import { LightsAreaViewStrategy } from "./area-view-strategy";

function define(tag: string, ctor: CustomElementConstructor): void {
  if (!customElements.get(tag)) customElements.define(tag, ctor);
}

// Dashboard:  strategy: { type: custom:lights-area-strategy }
define("ll-strategy-dashboard-lights-area-strategy", LightsAreaDashboardStrategy);
// View (intern für die Bereichs-Unteransichten, auch einzeln nutzbar):
//   strategy: { type: custom:lights-area-view, area_id: wohnzimmer }
define("ll-strategy-view-lights-area-view", LightsAreaViewStrategy);

console.info(
  `%c LIGHTS-AREA-STRATEGY %c v${__VERSION__} `,
  "color:#fff;background:#f9a825;font-weight:700;border-radius:3px 0 0 3px",
  "color:#f9a825;background:#263238;border-radius:0 3px 3px 0",
);
