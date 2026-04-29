# Customisation Implementation Plan

## 1. Goal

Implement a hybrid pricing and configuration flow for cabinets:

- the user sets project-level defaults first
- newly placed cabinets inherit those defaults automatically
- selected cabinets can override the inherited choices when needed
- the total price updates live without forcing the user into a rigid step-by-step wizard

The plan must support the commercial structure of a cabinet:

- inside body / carcass
- facade
- handle
- accessories

The current codebase already has the correct page shape for this approach:

- top area: [src/features/planner/components/PlannerHeader.jsx](/Users/anast/Documents/my_projects/room-visualizer/src/features/planner/components/PlannerHeader.jsx)
- left catalog: [src/features/planner/components/CabinetCatalogPanel.jsx](/Users/anast/Documents/my_projects/room-visualizer/src/features/planner/components/CabinetCatalogPanel.jsx)
- right inspector: [src/features/planner/components/SelectionInspectorPanel.jsx](/Users/anast/Documents/my_projects/room-visualizer/src/features/planner/components/SelectionInspectorPanel.jsx)
- pricing summary: [src/features/planner/components/PlannerSummaryPanel.jsx](/Users/anast/Documents/my_projects/room-visualizer/src/features/planner/components/PlannerSummaryPanel.jsx)
- main reducer/store: [src/features/cupboards/state/cupboardReducer.js](/Users/anast/Documents/my_projects/room-visualizer/src/features/cupboards/state/cupboardReducer.js)
- current pricing selector: [src/features/cupboards/selectors.js](/Users/anast/Documents/my_projects/room-visualizer/src/features/cupboards/selectors.js)

The main implementation principle is: extend the current planner rather than redesign it.

## 2. Recommended Product Model

### 2.1 Primary UX flow

Recommended flow:

1. User sets room dimensions.
2. User chooses project defaults for cabinet finish options.
3. User places cabinets into the room.
4. Each placed cabinet inherits the project defaults by default.
5. User selects an individual cabinet only when they need an exception.
6. Cart and total recalculate immediately.

### 2.2 Scope of global vs local settings

Recommended default ownership:

- `inside body / carcass`: project-level default first
- `facade`: project-level default first
- `handle`: project-level default first
- `accessory preset`: project-level default first
- `individual accessories`: cabinet-level override

Important nuance:

- `accessory preset` belongs at project level because it reduces repetition.
- `individual accessory items` belong at cabinet level because the need depends on cabinet function.
- `carcass` can stay project-level only in v1 if per-cabinet carcass exceptions are rare.

### 2.3 V1 commercial language

Use `Live estimate`, not `final quote`.

Reason:

- the current app already excludes delivery, installation, and tax
- introducing more pricing dimensions makes precision more important
- the UI should stay transparent and avoid overpromising

## 3. Current Codebase Constraints

These constraints drive the technical plan.

### 3.1 Pricing is currently embedded into the cabinet variant

In [src/features/cupboards/model/catalog.js](/Users/anast/Documents/my_projects/room-visualizer/src/features/cupboards/model/catalog.js):

- each variant stores a single `price`
- `resolveStarterCabinetInstance()` copies that `price` onto the cupboard instance
- `startingPrice` and `maxPrice` are derived directly from variant prices

This means the current system assumes:

- one cabinet variant has one final price
- there is no separate line-item breakdown for facade, handle, accessories, or carcass upgrades

### 3.2 The reducer stores resolved cupboard instances

In [src/features/cupboards/state/cupboardReducer.js](/Users/anast/Documents/my_projects/room-visualizer/src/features/cupboards/state/cupboardReducer.js):

- cabinets are created via `createCupboard()`
- the cupboard object is the runtime state unit
- pricing is not derived centrally after placement; it is carried on the cupboard

This is good for placement, but too weak for layered pricing.

### 3.3 Summary pricing is a simple sum

In [src/features/cupboards/selectors.js](/Users/anast/Documents/my_projects/room-visualizer/src/features/cupboards/selectors.js):

- `selectPricingLineItems()` uses `cupboard.price`
- `selectPricingSummary()` sums the line items

This must be upgraded into a proper pricing engine.

### 3.4 Persistence does not store configuration choices

In [src/features/planner/lib/projectPersistence.js](/Users/anast/Documents/my_projects/room-visualizer/src/features/planner/lib/projectPersistence.js):

- project schema is version `1`
- modules store cabinet snapshot and active variant
- pricing snapshot stores only resolved totals and per-line `price`

This will need a versioned migration path.

### 3.5 3D rendering uses a fixed cabinet theme

In:

- [src/features/cupboards/lib/cabinetAppearance.js](/Users/anast/Documents/my_projects/room-visualizer/src/features/cupboards/lib/cabinetAppearance.js)
- [src/features/cupboards/components/KitchenCabinetModel.jsx](/Users/anast/Documents/my_projects/room-visualizer/src/features/cupboards/components/KitchenCabinetModel.jsx)

the cabinet body, front, interior, and handle colors are derived from interaction state only:

- default
- selected
- moving
- invalid
- ghost

The rendering layer does not yet reflect chosen facade or handle finishes.

## 4. Core Product Decisions

These decisions should be treated as part of the implementation contract.

### 4.1 Keep the single-page planner layout

Do not convert the app into:

- a wizard
- a checkout flow
- a multi-step modal flow

The current workbench layout is already correct for a layout-first experience.

### 4.2 Extend the current `CupboardProvider` instead of introducing a second store

Reason:

- placement state already lives there
- selection state already lives there
- pricing summary already depends on that state
- a second provider would create avoidable synchronization complexity

Recommendation:

- keep one reducer/context for room-cabinet interaction state
- add project defaults and cabinet customisation to that same state tree

### 4.3 Derive totals from selectors, not reducer-side mutation

Do not mutate `cupboard.price` every time the user changes facade or handle.

Instead:

- store base cabinet data plus chosen option ids
- derive effective customization and total price in pure selector/model functions
- only serialize resolved totals into export snapshots

This avoids drift between UI state and pricing state.

### 4.4 Keep placement behavior unchanged

This feature should not rewrite:

- placement preview
- move interactions
- resize interactions
- wall snapping
- collision validation

Customisation is a pricing and display layer on top of the existing placement model.

### 4.5 Support `carcass` structurally even if the first UI hides it

Because the business model explicitly includes the inside body, the data model should include it from the start.

Recommended rule:

- add `carcassId` to project defaults and cabinet customisation state
- expose the carcass selector in the top bar only if the catalog contains more than one carcass option

This prevents a future schema rewrite if carcass options are introduced after facade and handle.

### 4.6 Accessories are price-only in v1

Do not attempt to render interior accessories in 3D in the first implementation.

V1 accessory behavior:

- selectable in UI
- included in compatibility rules
- included in price breakdown
- optionally listed in summary/cart
- not visually modeled inside the cabinet yet

This keeps scope under control.

### 4.7 Keep prices in whole currency units for now

Recommended v1 pricing rule:

- continue using whole-number `USD` values, matching the current catalog

Reason:

- it keeps migration smaller
- current formatting already assumes integer-like values
- the current starter catalog uses whole numbers

Future note:

- if facade pricing later moves to per-area rates with cents, migrate the engine to minor units then
- do not block this feature on a full money-unit refactor now

## 5. Target Data Model

## 5.1 New option catalogs

Add new model files next to the existing cabinet catalog:

- `src/features/cupboards/model/customizationCatalog.js`
- `src/features/cupboards/model/pricing.js`
- `src/features/cupboards/model/customization.js`

Recommended contents of `customizationCatalog.js`:

- `starterCarcassCatalog`
- `starterFacadeCatalog`
- `starterHandleCatalog`
- `starterAccessoryCatalog`
- `starterAccessoryPresetCatalog`

Each option should be normalized and referenced by id.

### 5.1.1 Example option shapes

```js
const facadeOption = {
  id: "facade-oak-matte",
  label: "Oak matte",
  swatch: "#b68c5a",
  materialFamily: "oak",
  compatibleCategories: ["base", "drawer", "wall", "tall", "corner"],
  pricing: {
    mode: "front-area-band",
    bands: [
      { maxAreaSqM: 0.35, surcharge: 40 },
      { maxAreaSqM: 0.65, surcharge: 65 },
      { maxAreaSqM: Infinity, surcharge: 90 }
    ]
  },
  appearance: {
    frontColor: "#d3b089"
  }
};

const handleOption = {
  id: "handle-brushed-steel",
  label: "Brushed steel",
  compatibleFrontTypes: ["doubleDoor", "drawers"],
  pricing: {
    mode: "per-handle-unit",
    surcharge: 12
  },
  appearance: {
    handleColor: "#8d8f95"
  },
  dimensions: {
    defaultLengthMm: 192
  }
};

const accessoryOption = {
  id: "accessory-cutlery-insert",
  label: "Cutlery insert",
  compatibleCategories: ["drawer"],
  compatibleWidths: [400, 450, 600],
  pricing: {
    mode: "flat",
    surcharge: 25
  }
};

const accessoryPreset = {
  id: "preset-standard",
  label: "Standard",
  defaultAccessoryIdsByCategory: {
    drawer: ["accessory-cutlery-insert"],
    base: [],
    wall: [],
    tall: []
  }
};
```

## 5.2 Cabinet runtime state

Each cupboard should keep only ids and override intent, not fully resolved option objects.

Recommended cupboard shape extension:

```js
{
  id: 1,
  catalogId: "base-double-door",
  activeVariantId: "600x720x560",
  position: { x: 0, y: 0, z: 0 },
  rotation: 0,
  wall: "back",
  customisation: {
    carcassId: null,
    facadeId: null,
    handleId: null,
    accessoryPresetId: null,
    accessoryIds: null
  }
}
```

Interpretation:

- `null` means `inherit project default`
- `accessoryIds: null` means `use effective preset`
- `accessoryIds: []` means `override preset and explicitly choose no accessories`

This is simpler than storing separate `mode` enums for each field.

## 5.3 Project-level defaults state

Extend reducer state with:

```js
{
  projectCustomisation: {
    carcassId: "carcass-standard-white",
    facadeId: "facade-white-matte",
    handleId: "handle-brushed-steel",
    accessoryPresetId: "preset-standard"
  }
}
```

Recommended reducer rule:

- initialize these defaults from a defined starter package in the catalog
- never leave the planner without a valid project default set

That prevents empty-state pricing ambiguity.

## 5.4 Derived view-model shape

Create pure resolvers that produce a fully resolved cabinet configuration:

```js
{
  effectiveCustomisation: {
    carcassId: "carcass-standard-white",
    facadeId: "facade-white-matte",
    handleId: "handle-brushed-steel",
    accessoryPresetId: "preset-standard",
    accessoryIds: ["accessory-cutlery-insert"]
  },
  sources: {
    carcass: "project",
    facade: "override",
    handle: "project",
    accessories: "project-preset"
  },
  compatibility: {
    isValid: true,
    issues: []
  }
}
```

This derived object should power:

- inspector labels
- badges such as `Customized`
- cart item descriptions
- render appearance
- price breakdown

## 6. Pricing Model

## 6.1 Split cabinet pricing into body price plus option surcharges

Recommended rule:

- keep existing variant `price` as the base cabinet body price for v1
- layer customization surcharges on top

This is the least disruptive migration path because current catalog data can remain valid.

Meaning in v1:

- existing `variant.price` becomes `body/base cabinet price`
- carcass surcharge may be `0` for the starter carcass
- facade surcharge may be `0` for the starter facade
- handle surcharge may be `0` for the starter handle
- accessory preset may resolve to zero or more accessory item charges

## 6.2 Create a dedicated pricing engine

Add a pure model module:

- `src/features/cupboards/model/pricing.js`

Recommended exported functions:

- `resolveEffectiveCustomisation(cupboard, projectCustomisation)`
- `resolveCabinetFrontMetrics(cupboard)`
- `calculateCupboardPriceBreakdown(cupboard, projectCustomisation)`
- `calculatePricingLineItem(cupboard, projectCustomisation)`
- `calculatePricingSummary(cupboards, projectCustomisation)`

### 6.2.1 Price breakdown shape

```js
{
  cupboardId: 1,
  displayName: "Double-door base cabinet",
  bodyPrice: 160,
  carcassPrice: 0,
  facadePrice: 40,
  handlePrice: 24,
  accessoriesPrice: 25,
  totalPrice: 249,
  currency: "USD"
}
```

## 6.3 Front and handle metrics should come from the cabinet model

Use [src/features/cupboards/model/renderModel.js](/Users/anast/Documents/my_projects/room-visualizer/src/features/cupboards/model/renderModel.js) as the source for:

- front type
- door count
- drawer count
- handle orientation defaults

Introduce a helper that derives:

- total visible front area
- total handle count
- whether handles are allowed, required, or optional

That keeps pricing aligned with actual cabinet geometry.

## 6.4 Compatibility should be explicit

Do not silently apply invalid option ids.

Required compatibility rules:

- `carcass` vs cabinet category
- `facade` vs cabinet category and front presence
- `handle` vs front type
- `accessory` vs category
- `accessory` vs active width when necessary

Recommended behavior when an override becomes invalid:

- remove the invalid override automatically
- fall back to the project default or preset
- show a user-facing message if the change was caused by a user action such as replace or resize

Examples:

- resizing a drawer cabinet from `600` to `300` can invalidate a wide insert
- replacing a drawer unit with a door cabinet can invalidate drawer-only accessories

## 6.5 Catalog display pricing rule

Catalog price labels should no longer mean `body only`.

Recommended behavior:

- show `With current defaults` price
- continue to show the price table by width
- compute that table from base cabinet price plus effective project defaults

This avoids a misleading low anchor.

## 7. State and Reducer Changes

## 7.1 Extend `initialCupboardState`

Add:

- `projectCustomisation`

Keep:

- `cupboards`
- `placementPreview`
- `activeMove`
- `activeResize`
- `selectedCupboardId`
- `nextCupboardId`

## 7.2 Preserve inheritance on placement

When a cupboard is placed:

- create it with `customisation` fields set to `null`
- do not copy the current project default ids into the cupboard record

Reason:

- inherited cabinets should update automatically when project defaults change
- explicit copying would make global changes expensive and error-prone

## 7.3 Add reducer actions

Recommended action set:

- `UPDATE_PROJECT_CUSTOMISATION`
- `UPDATE_CUPBOARD_CUSTOMISATION`
- `RESET_CUPBOARD_CUSTOMISATION`

Optional convenience actions may wrap those at provider level, but the reducer API should stay generic.

Example payloads:

```js
{
  type: "UPDATE_PROJECT_CUSTOMISATION",
  payload: { facadeId: "facade-oak-matte" }
}

{
  type: "UPDATE_CUPBOARD_CUSTOMISATION",
  payload: {
    cupboardId: 4,
    patch: { facadeId: "facade-oak-matte", accessoryIds: [] }
  }
}

{
  type: "RESET_CUPBOARD_CUSTOMISATION",
  payload: { cupboardId: 4 }
}
```

## 7.4 Preserve customisation through layout operations

Moving and rotating:

- should preserve customisation without change

Resizing:

- should preserve customisation if still compatible
- should auto-prune incompatible accessories

Replacing a cabinet:

- should preserve compatible overrides
- should clear incompatible overrides

This must be explicitly handled in `REPLACE_SELECTED_CUPBOARD` and width-step logic.

## 8. UI and UX Implementation

## 8.1 Add a project customisation bar

Create:

- `src/features/planner/components/ProjectCustomisationBar.jsx`
- `src/features/planner/styles/customisation-bar.css`

Place it above the current planner header in [src/features/planner/PlannerPage.jsx](/Users/anast/Documents/my_projects/room-visualizer/src/features/planner/PlannerPage.jsx).

Recommended controls:

- `Inside body / carcass` selector, shown only if more than one carcass option exists
- `Facade` selector
- `Handle` selector
- `Accessory preset` selector
- live total pill
- summary message such as `Applies to 12 inherited cabinets`

Recommended interaction details:

- sticky on desktop
- collapsible stack on narrow screens
- changing a global value should update catalog pricing and summary immediately

## 8.2 Update the planner header copy

The current header still describes only placement and rotation.

Update [src/features/planner/components/PlannerHeader.jsx](/Users/anast/Documents/my_projects/room-visualizer/src/features/planner/components/PlannerHeader.jsx) to describe the new flow:

- choose project defaults
- place cabinets
- customize exceptions on selection

Keep the header lightweight. The new top bar becomes the real working control surface.

## 8.3 Update the catalog panel

In [src/features/planner/components/CabinetCatalogPanel.jsx](/Users/anast/Documents/my_projects/room-visualizer/src/features/planner/components/CabinetCatalogPanel.jsx):

- replace `From $X` semantics with `With current defaults`
- keep height selection and width table
- compute each row's displayed prices from current project defaults
- make sure drag-to-place continues to work without extra clicks

Recommended copy:

- `Each row places the selected cabinet with the current project finish defaults.`

## 8.4 Upgrade the selection inspector into a cabinet configuration panel

In [src/features/planner/components/SelectionInspectorPanel.jsx](/Users/anast/Documents/my_projects/room-visualizer/src/features/planner/components/SelectionInspectorPanel.jsx):

add new sections above rotate/delete:

- `Inside body / carcass`
- `Facade`
- `Handle`
- `Accessories`
- `Price breakdown`

Recommended behavior:

- each section should show `Using project default` vs `Custom`
- selecting a custom value should immediately update the selected cabinet and total
- `Reset to project defaults` should clear all overrides in one action
- cabinets with any override should show a visible `Customized` badge

Accessory UX recommendation:

- start with a preset summary
- expose individual accessory toggles only when `Custom accessories` is enabled

## 8.5 Upgrade the summary panel into a true line-item cart

In [src/features/planner/components/PlannerSummaryPanel.jsx](/Users/anast/Documents/my_projects/room-visualizer/src/features/planner/components/PlannerSummaryPanel.jsx):

- keep the current running total
- add a short breakdown legend: `Body + carcass + facade + handle + accessories`
- show line-item configuration summary
- show line-item total from the new pricing engine

Recommended per-line metadata:

- cabinet name
- dimensions
- customization chips such as `Oak facade`, `Steel handle`, `Standard preset`
- `Customized` flag when cabinet overrides project defaults

V1 decision:

- keep one line per cabinet instance
- do not group identical cabinets yet

Reason:

- the current summary already uses instance lines
- grouping adds new selection and identity complexity
- grouping can be added later without changing core state design

## 8.6 Reflect chosen finishes in the renderer

Update:

- [src/features/cupboards/lib/cabinetAppearance.js](/Users/anast/Documents/my_projects/room-visualizer/src/features/cupboards/lib/cabinetAppearance.js)
- [src/features/cupboards/components/KitchenCabinetModel.jsx](/Users/anast/Documents/my_projects/room-visualizer/src/features/cupboards/components/KitchenCabinetModel.jsx)
- [src/features/cupboards/components/CupboardRenderer.jsx](/Users/anast/Documents/my_projects/room-visualizer/src/features/cupboards/components/CupboardRenderer.jsx)

Recommended refactor:

1. compute a base appearance theme from effective customisation
2. apply interaction-state modifiers on top of that base theme

Do not continue using a fixed default material palette for all cabinets.

Expected visible result:

- facade changes front color/material
- carcass changes body/interior color
- handle changes handle color and optional length default
- accessories do not change the 3D model in v1

## 9. Persistence and Import/Export

## 9.1 Bump schema version

Update [src/features/planner/lib/projectPersistence.js](/Users/anast/Documents/my_projects/room-visualizer/src/features/planner/lib/projectPersistence.js):

- `PROJECT_SCHEMA_VERSION = 2`

## 9.2 Persist project-level defaults

Add top-level export data:

```json
{
  "projectCustomisation": {
    "carcassId": "carcass-standard-white",
    "facadeId": "facade-white-matte",
    "handleId": "handle-brushed-steel",
    "accessoryPresetId": "preset-standard"
  }
}
```

## 9.3 Persist cabinet overrides

Each module should store its override object:

```json
{
  "id": 3,
  "catalogItemId": "base-double-door",
  "activeVariantId": "600x720x560",
  "customisation": {
    "carcassId": null,
    "facadeId": "facade-oak-matte",
    "handleId": null,
    "accessoryPresetId": null,
    "accessoryIds": ["accessory-cutlery-insert"]
  }
}
```

## 9.4 Export richer pricing snapshots

Update pricing snapshots so line items can preserve breakdown data:

```json
{
  "lineItems": [
    {
      "cupboardId": 3,
      "catalogId": "base-double-door",
      "bodyPrice": 160,
      "carcassPrice": 0,
      "facadePrice": 40,
      "handlePrice": 24,
      "accessoriesPrice": 25,
      "totalPrice": 249
    }
  ]
}
```

This is useful for later auditing and diffing even if the UI initially shows only the total.

## 9.5 Support importing schema version 1

The importer should still accept older project files.

Recommended migration behavior for `schemaVersion: 1`:

- restore room and cupboard placement as before
- assign the starter project defaults from the current customization catalog
- set each cupboard `customisation` to inherited values
- treat old per-cabinet `price` as a historical snapshot only, not as the new source of truth

Important warning:

- schema v1 imports cannot reconstruct the user's original facade/handle/accessory intent because that data never existed
- the app should show a note that old projects were loaded with current default customisation settings

## 10. Detailed Implementation Steps

### Step 1. Freeze business rules and starter option catalog

Purpose:

- avoid building UI against unclear commercial rules

Tasks:

- define the starter carcass options
- define the starter facade options
- define the starter handle options
- define the starter accessory options and presets
- define compatibility rules for each option type
- choose the starter project default package ids

Decisions to lock:

- whether carcass is exposed in v1 or stored-only
- which cabinet categories support which accessories
- whether all starter handles are valid for all current front types

Done when:

- `customizationCatalog.js` can be filled with real or placeholder business data without ambiguity

### Step 2. Add a customisation domain layer

Purpose:

- separate option resolution logic from React components

Tasks:

- create `customizationCatalog.js`
- create `customization.js`
- create lookup helpers and compatibility helpers
- add unit tests for resolution helpers

Recommended functions:

- `getDefaultProjectCustomisation()`
- `findFacadeOption(id)`
- `findHandleOption(id)`
- `findAccessoryOption(id)`
- `resolveEffectiveCustomisation(cupboard, projectCustomisation)`
- `resolveCompatibleOverrideOrFallback(cupboard, override, projectCustomisation)`

Done when:

- the reducer and components can use stable pure functions instead of inline lookup logic

### Step 3. Introduce the pricing engine

Purpose:

- stop treating `cupboard.price` as the only truth

Tasks:

- add `pricing.js`
- implement body plus surcharge calculation
- derive handle count from cabinet model
- derive facade area band from cabinet dimensions and front metrics
- implement accessory total calculation
- add unit tests for pricing combinations

Done when:

- one pure function can return a complete line-item breakdown for any cupboard

### Step 4. Extend runtime state and reducer actions

Purpose:

- make project defaults and cabinet overrides first-class state

Tasks:

- extend `initialCupboardState`
- add reducer support for project customisation updates
- add reducer support for cabinet customisation updates
- preserve overrides during move/rotate
- validate or prune overrides during resize and replace
- expose new actions from `CupboardProvider`

Done when:

- all customisation changes flow through reducer actions instead of component-local state

### Step 5. Replace the pricing selectors

Purpose:

- make summary and cart read from the new pricing engine

Tasks:

- update `selectPricingLineItems()`
- update `selectPricingSummary()`
- add selectors for resolved cabinet customisation
- add selectors for global-vs-local source labels
- update tests in `selectors.test.js`

Done when:

- summary totals no longer depend on `cupboard.price` alone

### Step 6. Update project persistence

Purpose:

- make exports and imports preserve the new configuration model

Tasks:

- bump project schema version to `2`
- serialize `projectCustomisation`
- serialize module `customisation`
- enrich pricing snapshot line items
- keep schema v1 import support
- add migration tests

Done when:

- a saved project round-trips with custom facade, handle, and accessory overrides intact

### Step 7. Build the top customisation bar

Purpose:

- give the user a clear place to set project defaults before and during placement

Tasks:

- create `ProjectCustomisationBar.jsx`
- wire it to provider actions/selectors
- show only relevant selectors
- surface current total and affected cabinet count
- add responsive CSS

Done when:

- changing facade, handle, carcass, or preset from the top bar updates the planner instantly

### Step 8. Upgrade the catalog panel pricing

Purpose:

- keep placement simple while avoiding misleading `body-only` prices

Tasks:

- recalculate display prices from project defaults
- update row copy
- keep drag-to-place untouched
- make width tables reflect effective line-item totals

Done when:

- the catalog communicates the price the user is actually designing with

### Step 9. Upgrade the selection inspector

Purpose:

- let the user make exceptions without leaving the layout workflow

Tasks:

- add customisation controls to the inspector
- add inherited/custom labels
- add reset action
- add price breakdown section
- keep rotate/delete actions below configuration
- add component tests for inheritance and reset behavior

Done when:

- a selected cabinet can be fully customized and repriced from the right panel

### Step 10. Upgrade the pricing summary/cart

Purpose:

- show the commercial result clearly

Tasks:

- display customization chips per line item
- show line-item total from pricing engine
- clarify price composition in the panel copy
- keep selection sync when clicking a line item

Done when:

- the right panel reads like a transparent cart, not only a raw total

### Step 11. Connect rendering to chosen finishes

Purpose:

- make the 3D scene visually confirm the configuration choices

Tasks:

- add appearance resolution helpers
- pass effective customisation to cupboard mesh rendering
- preserve selected/ghost/invalid feedback
- ensure custom colors still look distinct in invalid or selected states

Done when:

- facade and handle changes are visible in the scene immediately

### Step 12. Regression pass and cleanup

Purpose:

- prevent this feature from destabilizing placement and persistence

Tasks:

- run full existing test suite
- add missing unit tests around replace/resize edge cases
- clean up stale `price` wording in UI copy
- verify import/export manually with both schema versions
- review responsive layout

Done when:

- the planner still places, moves, resizes, exports, and imports correctly with customisation enabled

## 11. File-Level Impact

Most likely new files:

- `src/features/cupboards/model/customizationCatalog.js`
- `src/features/cupboards/model/customization.js`
- `src/features/cupboards/model/pricing.js`
- `src/features/planner/components/ProjectCustomisationBar.jsx`
- `src/features/planner/styles/customisation-bar.css`

Most likely updated files:

- `src/features/cupboards/model/catalog.js`
- `src/features/cupboards/state/cupboardReducer.js`
- `src/features/cupboards/state/CupboardProvider.jsx`
- `src/features/cupboards/selectors.js`
- `src/features/planner/PlannerPage.jsx`
- `src/features/planner/components/PlannerHeader.jsx`
- `src/features/planner/components/CabinetCatalogPanel.jsx`
- `src/features/planner/components/SelectionInspectorPanel.jsx`
- `src/features/planner/components/PlannerSummaryPanel.jsx`
- `src/features/planner/lib/roomFormatting.js`
- `src/features/planner/lib/projectPersistence.js`
- `src/features/cupboards/lib/cabinetAppearance.js`
- `src/features/cupboards/components/KitchenCabinetModel.jsx`
- `src/features/cupboards/components/CupboardRenderer.jsx`

## 12. Testing Strategy

## 12.1 Unit tests

Add or extend tests for:

- customization option lookup
- effective inheritance resolution
- compatibility fallback behavior
- price breakdown calculation
- project default changes affecting inherited cabinets only
- accessory invalidation on resize
- override preservation on move and rotate
- override pruning on replace

## 12.2 Selector tests

Extend:

- [src/features/cupboards/selectors.test.js](/Users/anast/Documents/my_projects/room-visualizer/src/features/cupboards/selectors.test.js)

Cover:

- total price with mixed inherited and overridden cabinets
- line-item breakdown integrity
- selection sync in pricing summary

## 12.3 Reducer tests

Extend:

- [src/features/cupboards/state/cupboardReducer.test.js](/Users/anast/Documents/my_projects/room-visualizer/src/features/cupboards/state/cupboardReducer.test.js)

Cover:

- project default changes
- per-cabinet override changes
- reset to defaults
- replacement and resize compatibility cleanup

## 12.4 Persistence tests

Extend:

- [src/features/planner/lib/projectPersistence.test.js](/Users/anast/Documents/my_projects/room-visualizer/src/features/planner/lib/projectPersistence.test.js)

Cover:

- schema v2 export/import round-trip
- schema v1 import migration
- pricing snapshot breakdown serialization

## 12.5 Component tests

Extend or add tests for:

- top customisation bar
- selection inspector customisation controls
- summary panel line-item chips and totals
- catalog panel price labels under changed project defaults

## 12.6 Manual QA checklist

Manually verify:

1. Change project facade, then place cabinets.
2. Change project facade after cabinets are already placed.
3. Override one cabinet facade and confirm global updates no longer change it.
4. Resize a cabinet and confirm incompatible accessories are removed correctly.
5. Replace a cabinet and confirm invalid overrides are cleared.
6. Export a custom project and re-import it.
7. Import an old schema v1 project and verify fallback behavior.
8. Check that selected/ghost/invalid render states still remain readable with custom colors.

## 13. Risks and Mitigations

### Risk 1. Price logic becomes scattered

Mitigation:

- keep all price resolution in `pricing.js`
- keep selectors thin
- do not compute prices in components

### Risk 2. Inheritance becomes hard to reason about

Mitigation:

- use `null means inherit` consistently
- create one resolver that every UI surface uses
- avoid duplicating `source` logic in components

### Risk 3. Rendering colors hide selection/invalid feedback

Mitigation:

- apply interaction-state overlays on top of the chosen finish theme
- test light and dark facades

### Risk 4. Old imports lose pricing fidelity

Mitigation:

- support schema v1 explicitly
- show an informative migration note
- preserve old snapshots as historical references where possible

### Risk 5. Accessories create scope explosion

Mitigation:

- keep accessories price-only in v1
- use presets first
- defer 3D accessory rendering and grouped cart behavior

## 14. Recommended Delivery Sequence

Best implementation order:

1. Step 1 through Step 5 first: data model, reducer, selectors, pricing engine.
2. Step 6 next: persistence, before the UI becomes too dependent on temporary state.
3. Step 7 through Step 10 after the state model is stable.
4. Step 11 last: rendering polish.
5. Step 12 at the end: regression pass and cleanup.

This order minimizes rework because:

- the UI depends on a stable pricing contract
- persistence depends on a stable state shape
- rendering depends on a stable effective customization resolver

## 15. Out of Scope for First Delivery

Do not include these in the first implementation unless a business requirement forces them:

- a full wizard flow
- grouped cart lines for identical cabinets
- 3D rendering of internal accessories
- vendor-rule engines outside the static starter catalog
- cloud sync or server-side persistence
- quotation workflows beyond the current JSON export/import model

## 16. Final Recommendation

Build this as a pricing and configuration extension of the current planner, not as a separate configurator.

The most important technical decision is to introduce:

- a proper customization catalog
- a pure pricing engine
- inheritance-based cabinet configuration

Once those three pieces exist, the rest of the UI can stay close to the current architecture and grow safely.
