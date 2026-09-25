# Lights & Areas Strategy

Eine Dashboard-Strategie für Home Assistant, die dein Dashboard vollständig automatisch aus der Bereichs-, Geräte- und Entitäten-Registry erzeugt.

**Startseite:** Pro Bereich ein Abschnitt mit der Bereichskarte als Kopf und den Lampen des Bereichs darunter (optional nach Etagen gruppiert). Bereiche ohne Lampen erscheinen gesammelt unter „Weitere Bereiche“. Dimmbare Lampen bekommen einen Helligkeitsregler, dazu gibt es einen Button „Alle Lampen aus“.

**Detailansichten:** Ein Tipp auf eine Bereichskarte (oder auf die Überschrift einer Lampengruppe) öffnet eine Unteransicht mit allen Geräten dieses Bereichs, gruppiert nach Typ: Beleuchtung, Rollläden, Klima, Schalter, Ventilatoren, Medien, Schlösser, Staubsauger, Kameras, Status, Sensoren und Sonstiges.

Versteckte Entitäten sowie Konfigurations- und Diagnose-Entitäten werden automatisch ausgelassen, ebenso Bereiche ohne Geräte. Neue Geräte erscheinen nach einem Neuladen der Seite von selbst.

Voraussetzung: Home Assistant 2024.10 oder neuer (Sections-Ansicht, Heading-Karte, `perform-action`).

## Installation über HACS

1. HACS → ⋮ → **Benutzerdefinierte Repositories** → URL dieses Repositorys eintragen, Typ **Dashboard**.
2. „Lights & Areas Strategy“ herunterladen. HACS registriert die Ressource `/hacsfiles/lights-area-strategy/lights-area-strategy.js` automatisch.
3. Browser neu laden (ggf. Cache leeren).

### Manuelle Installation

`dist/lights-area-strategy.js` nach `config/www/` kopieren und unter **Einstellungen → Dashboards → ⋮ → Ressourcen** als `/local/lights-area-strategy.js` vom Typ *JavaScript-Modul* hinzufügen.

## Verwendung

Neues Dashboard anlegen („Neu beginnen“), Bearbeiten → ⋮ → **Raw-Konfigurationseditor** und den Inhalt ersetzen durch:

```yaml
strategy:
  type: custom:lights-area-strategy
```

### Optionen

```yaml
strategy:
  type: custom:lights-area-strategy
  title: Zuhause
  area_order: [wohnzimmer, kuche, schlafzimmer]   # Rest folgt alphabetisch
  hidden_areas: [technikraum]
  hidden_entities: [light.test_lampe]
  extra_lights: [switch.buero_spot]  # Schalter, die als Lampe gelten sollen
  group_by_floor: true          # Bereichskarten nach Etagen (Standard: true)
  show_area_cards: true         # Standard: true
  show_unassigned_lights: true  # Lampen ohne Bereich (Standard: true)
  show_all_off_button: true     # Standard: true
  show_empty_areas: false       # Standard: false
```

Die `area_id` eines Bereichs findest du in der URL unter **Einstellungen → Bereiche**.

Die Bereichsansicht lässt sich auch einzeln in einem eigenen Dashboard nutzen:

```yaml
views:
  - title: Wohnzimmer
    strategy:
      type: custom:lights-area-view
      area_id: wohnzimmer
```

## Entwicklung

```bash
npm install
npm run build   # Typprüfung + Bundle nach dist/lights-area-strategy.js
npm run watch   # Rebuild bei Änderungen
```

## Veröffentlichen für HACS

1. Repository auf GitHub öffentlich anlegen, am besten mit dem Namen `lights-area-strategy`, und eine Beschreibung sowie Topics (z. B. `home-assistant`, `hacs`, `lovelace`, `dashboard-strategy`) setzen – HACS prüft beides.
2. Code pushen. Der Workflow *Validate* prüft das Repository mit der HACS-Action.
3. Ein GitHub-Release erstellen (Tag z. B. `v1.0.0`). Der Workflow *Release* baut die Datei und hängt `lights-area-strategy.js` an das Release an; HACS lädt sie von dort.
