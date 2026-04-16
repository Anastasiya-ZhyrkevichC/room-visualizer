# Incremental Implementation Plan Variative Cabinet

This plan assumes the current prototype already has:

- a planner-style layout with a left catalog panel, 3D room shell, and right-side cabinet inspector
- grouped starter catalog data rendered through `CabinetCatalogPanel`
- drag-to-place cabinet placement plus selection, move, rotate, and delete flows
- shared placement validation for overlap and corner collision checks

## Current implementation check

- The catalog currently treats each starter cabinet as one fixed-size record. A cabinet row has one `width`, one `height`, one `depth`, one `size`, and one `catalogId`.
- `startPlacementPreview` and `createPlacementPreview` create a fixed preview directly from that catalog record, so dropping from the catalog cannot choose between multiple widths or heights.
- `createCupboard` copies the fixed dimensions into the placed cabinet instance, and the reducer only supports move, rotate, and delete after placement.
- The catalog UI shows one dimensions label per row today, so it cannot present a compact list of all supported widths and heights for one cabinet family.
- The selected cabinet UI exists only in the right inspector. There is no in-scene control layer around the selected cabinet yet.

The 5 steps below focus specifically on turning fixed-size catalog items into cabinet definitions with size options, showing those options elegantly in the catalog, placing the smallest variant by default, and allowing width changes from simple arrows around the selected cabinet.

## Step 1. Split Cabinet Definitions From Size Variants

**Goal**

Represent one visible cabinet as one product definition that can expose multiple widths and heights without duplicating catalog rows.

**What is going to be implemented**

A cabinet-definition model where each visible catalog item keeps one stable identity plus its own supported width and height options, with one explicit rule for resolving the smallest default size.

**Description**

The current catalog model assumes that one row equals one exact physical object. That is the main architectural blocker. Before the UI changes, the catalog data needs a new shape: one cabinet definition that owns its own width and height choices. The implementation should also define whether widths and heights are fully combinable or whether some cabinets need an explicit compatibility table. Even if the first data set is simple, that decision belongs in the model layer so the UI does not make unsafe assumptions later.

**Required work**

- Introduce a cabinet-definition record that keeps one stable visible `id`, name, family, depth, render category, and model defaults.
- Add cabinet-specific size option data such as `availableWidths` and `availableHeights`, or an explicit variant list if not every width-height pair is valid.
- Add one shared helper that resolves the default placed variant as the smallest valid cabinet for that definition.
- Keep placed-cabinet identity separate from size selection so one cabinet can change width later without becoming a different catalog item.
- Decide where price belongs: on the shared cabinet definition or on individual size variants if larger widths need different pricing.
- Update formatting helpers so they can describe either one active size or one list of available sizes without duplicating business rules in UI components.

**Manual testing criteria**

- One cabinet definition can expose widths such as `300`, `350`, `400`, `450`, and `600` mm without creating five catalog rows.
- Each cabinet definition can also expose its own height options independently.
- The app can resolve the smallest valid width-height combination deterministically.
- Existing render defaults and family grouping still work after the catalog data shape changes.

## Step 2. Redesign Catalog Rows Around One Cabinet With Many Sizes

**Goal**

Show all possible widths and heights in the catalog clearly while still rendering only one cabinet row per product.

**What is going to be implemented**

A one-row-per-cabinet catalog presentation that summarizes the supported sizes in a compact, elegant format instead of showing one dimensions tuple only.

**Description**

The user should browse cabinets by type, not by a long list of near-duplicate sizes. The catalog row should therefore present one cabinet name plus a clean size summary. Widths and heights should read like product options, not like a debug dump. The important rule is that the catalog still shows one cabinet entry, and that entry must make the option range obvious enough that the user understands it can be resized after placement.

**Required work**

- Keep exactly one visible catalog row per cabinet definition.
- Replace the single dimensions label with a structured size summary, for example separate `Widths` and `Heights` lines or compact size chips.
- Keep depth readable, but treat it as secondary metadata if it does not vary for that cabinet.
- Make the size summary work for both short option lists and longer lists without turning the row into a very tall block.
- Preserve current add and drag-to-place behavior from the row itself.
- Add a small cue in the row copy or metadata that the cabinet is placed in its smallest size and can be resized after selection.

**Manual testing criteria**

- The catalog shows one cabinet row even when that cabinet supports many widths and heights.
- Width and height options are easy to scan and do not look like duplicated products.
- The row remains compact enough for the planner sidebar.
- Dragging or clicking `Add` still starts placement from that same row.

## Step 3. Make Placement and Instance State Variant-Aware

**Goal**

Ensure catalog placement uses the smallest cabinet by default and that the placed instance keeps enough metadata to change width later.

**What is going to be implemented**

Variant-aware placement preview and placed-cabinet state that resolve the smallest size on add, then preserve the source cabinet definition plus the currently selected size.

**Description**

The catalog rule is simple for the user: they see one cabinet and dropping it places the smallest version. Internally, that means placement preview cannot be built from a fixed catalog record anymore. It has to resolve a default variant first, then store both the cabinet definition and the active size on the preview and on the placed cupboard. That state shape is what later enables width arrows without re-creating the cabinet from scratch.

**Required work**

- Update `startPlacementPreview` and `createPlacementPreview` so they resolve the smallest valid size for the selected cabinet definition.
- Store both source-definition metadata and active size metadata on placement preview and placed cupboards.
- Keep active dimensions normalized in one place so `width`, `height`, `size`, footprint, and render model stay in sync.
- Make `createCupboard` preserve the chosen width and height instead of treating the cabinet as a permanently fixed catalog object.
- Keep selection, movement, rotation, and deletion compatible with the new variant-aware cabinet shape.
- Decide how variant changes affect display name and price so later UI does not show stale information after a resize.

**Manual testing criteria**

- Dragging a variable-size cabinet into the room places its smallest valid size.
- Clicking `Add` for the same cabinet also places the smallest valid size.
- The newly placed cabinet still knows which catalog definition it came from and which width and height are active.
- Moving or rotating that cabinet does not lose its active size.

## Step 4. Add Width Switching Around the Selected Cabinet

**Goal**

Let the user change the selected cabinet width directly in the scene with simple arrow controls.

**What is going to be implemented**

An in-scene width control layer attached to the selected cabinet, plus reducer actions that move to the previous or next valid width and revalidate the resized cabinet before commit.

**Description**

The right inspector is useful for details, but the requested interaction belongs in the scene itself. The selected cabinet should show simple arrows near its left and right sides, or another equally light in-scene control, so width switching feels spatial and immediate. The width change is not only a visual change. It affects footprint, wall span, collisions, and possibly price. Because of that, resizing should reuse the same placement validation rules the app already trusts for placement and move behavior.

**Required work**

- Add a selected-only in-scene control component anchored to the cabinet mesh, with previous and next width arrows.
- Introduce reducer actions for changing the selected cabinet to the previous or next supported width.
- Recompute the cabinet `size`, `width`, footprint, and wall alignment when the active width changes.
- Run the resized cabinet through the same overlap and corner-collision validation used for placement and movement.
- Prefer disabling or visually muting arrows that would lead to an invalid or unavailable width instead of letting resize silently fail.
- Keep height unchanged in this first interaction pass unless a later requirement adds height editing too.

**Manual testing criteria**

- Selecting a cabinet shows width arrows around that cabinet in the scene.
- Clicking the arrows steps through that cabinet's supported widths in order.
- The cabinet mesh and footprint update immediately when width changes.
- Width changes that would collide with neighboring cabinets or room bounds are blocked clearly.
- Deselecting the cabinet hides the width arrows again.

## Step 5. Align Inspector Details, Labels, and Regression Coverage

**Goal**

Finish the feature so the new variable-size behavior stays understandable and does not regress.

**What is going to be implemented**

Downstream UI updates plus automated coverage for option rendering, smallest-default placement, and width switching.

**Description**

The feature is not complete when the arrows work once. The right inspector, formatting helpers, and tests all need to reflect the new size model. Otherwise the app will still show old fixed-dimension assumptions in one place while the scene behaves differently in another. This final step keeps the planner coherent and leaves room for future height editing without redesigning the data model again.

**Required work**

- Update the right inspector so it shows the active selected size and, if useful, the full set of available widths and heights as reference.
- Keep user-facing labels consistent between catalog rows, stage messaging, and selected-cabinet details.
- Add catalog tests that verify one-row-per-cabinet rendering and correct width-height option summaries.
- Add reducer and model tests for smallest-default placement and width-step changes.
- Add validation tests that prove resize is blocked when the next width would overlap another cabinet or break wall constraints.
- Document whether height options are display-only for now or whether a later step will expose height editing too.

**Manual testing criteria**

- The selected cabinet details show the current active dimensions after a width change.
- Catalog and inspector labels stay consistent for the same cabinet before and after placement.
- Automated tests fail if a variable-size cabinet starts rendering as duplicate catalog rows again.
- Automated tests fail if default placement stops choosing the smallest valid size.
- Automated tests fail if invalid width expansion is allowed through collision boundaries.
