# Incremental Implementation Plan Size-Aware Pricing

This plan assumes the current prototype already has:

- variable-size starter cabinet definitions in `src/features/cupboards/model/catalog.js`
- width-step resizing for selected cupboards in `src/features/cupboards/state/cupboardReducer.js`
- in-scene width controls for selected cupboards in `src/features/cupboards/components/SelectedCupboardWidthControls.jsx`
- right-side cabinet details rendered through `src/features/planner/components/SelectionInspectorPanel.jsx`

## Current implementation check

- `createStarterCabinetDefinition` already stores per-variant `price`, plus family-level `startingPrice` and `maxPrice`, so the catalog data model knows that different sizes cost different amounts.
- `resolveStarterCabinetInstance` can resolve a cabinet family into one active size snapshot, including the matching `price` for the active variant.
- `STEP_SELECTED_CUPBOARD_WIDTH` already replaces the selected cupboard with the next supported width outcome, so the resize flow has a natural place to keep size and price in sync.
- `formatCatalogModulePrice` currently collapses variable-size cabinets into a family-level starting-price label such as `From $160`, which does not satisfy the client requirement to see the exact price for each supported module size.
- `PlannerSummaryPanel.jsx` still contains placeholder copy for pricing work, so there is no shared planner-level pricing contract yet that guarantees visible prices follow the active cabinet size after resize.

The single step below focuses specifically on making cabinet size the source of truth for all visible pricing, including exact per-size prices in the catalog and exact active-size pricing after placement.

## Step 1. Make Active Variant Price the Single Source of Truth

**Goal**

Ensure every placed cupboard shows and contributes the price of its currently active size instead of a fixed family price.

**What is going to be implemented**

One shared size-aware pricing flow that always resolves price from `activeVariantId`, updates that price on every valid width change, and exposes exact prices for each supported cabinet size in the catalog.

**Description**

The project already has the raw ingredients for size-aware pricing, but the contract is still too implicit. The catalog knows about variant prices, and the resize flow already steps through variants, yet the visible planner pricing can still feel fixed because there is no explicit rule that every pricing surface must resolve through the active size variant. The fix should make that rule concrete. Customers should be able to see the exact price tied to each supported module size before placement, and then see the placed cabinet continue using the exact price of its current active size after resize. That is the important product behavior: if a cabinet is available in several widths, the UI should not reduce that to a vague starting price when the customer is trying to compare real module options.

**Required work**

- Audit `resolveStarterCabinetInstance`, `createCupboard`, and `getCupboardWidthStepOutcome` to ensure the resolved cupboard object always carries the `price` for its current `activeVariantId`.
- Introduce one shared helper or selector for placed-cabinet pricing so the inspector and any planner pricing summary read the same active-instance value instead of recomputing from catalog-family fields.
- Replace family-level catalog price formatting with a size-aware catalog presentation that lets the user see the exact price for each supported module size.
- Update the visible pricing UI so a selected cupboard clearly shows the price of its active size after every valid width change.
- If room-level pricing is shown, derive totals from placed cupboard instances rather than from catalog families or starting prices.
- Add regression tests that cover exact per-size catalog pricing, default placement price, resize-to-next-variant price changes, and blocked resize preserving the old price.

**Manual testing criteria**

- Adding a cabinet with multiple supported widths shows the default placed size with its matching default price.
- Increasing or decreasing the width updates the visible placed-cabinet price to the matching variant price.
- Attempting a blocked resize leaves both the active size and the visible price unchanged.
- The catalog shows exact prices for the supported sizes of a multi-size cabinet instead of only a family entry price.
- A customer can tell which price belongs to which cabinet size before placing the module.
- Any room-level pricing total updates immediately after a valid resize.
