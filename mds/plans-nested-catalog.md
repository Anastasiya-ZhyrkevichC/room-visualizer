# Incremental Implementation Plan Nested Catalog

This plan assumes the current prototype already has:

- a planner-style layout with a left catalog panel, 3D room shell, and right-side inspector
- a starter cabinet catalog rendered through `CabinetCatalogPanel`
- item-level add and drag-to-place flows for visible catalog modules
- stable catalog item records with ids, names, dimensions, prices, and render-model defaults

## Current implementation check

- The catalog is already grouped, but it behaves more like a stack of large cards than a compact finder. Group headers and cabinet items both use generous padding and rounded-card styling, so the panel grows tall very quickly.
- Every populated group opens by default today. That keeps the current short catalog visible, but it will make scrolling worse once more cabinet families are added.
- The current visible family labels are still broad and technical: `Base cabinets`, `Drawer units`, `Wall cabinets`, `Tall units`, and `Corner cabinets`.
- The current starter data only populates base, drawer, and tall groups. Wall and corner groups exist but are empty.
- The cabinet renderer only distinguishes `doubleDoor` and `drawers` front types today, so an upper cabinet that opens upward will likely need either a new front type or a temporary visual fallback.

The 5 steps below focus specifically on turning the current card-heavy nested tree into a compact expandable catalog that reduces scrolling, uses more natural kitchen naming, and covers the six requested cabinet families.

## Step 1. Introduce Explicit Catalog Families With Natural Labels

**Goal**

Define the catalog around the cabinet families the user expects to browse, without tying UI wording too tightly to the internal render category.

**What is going to be implemented**

A clear catalog-family layer with six visible families:

- `Base cabinets with doors`
- `Base cabinets with drawers`
- `Wall cabinets with doors`
- `Lift-up wall cabinets`
- `Tall cabinets`
- `Corner cabinets`

**Description**

The current `category` field does double duty: it helps drive render defaults and it also controls how the catalog is grouped. That is workable for a tiny prototype, but it becomes brittle once the browse structure needs to feel more natural to users. This step introduces explicit catalog-family metadata so the UI can show natural kitchen-first labels while the rendering and placement model can keep using the internal cabinet type information it actually needs.

**Required work**

- Add a dedicated catalog-family field or grouping key for each visible starter module.
- Define the six requested visible families in a stable browse order.
- Keep internal cabinet type data available for render defaults, placement, and later pricing logic.
- Rename visible family labels in the catalog to the more natural wording above.
- Update any supporting label helpers if the selection or summary panels show category-family wording.
- Decide whether older fixtures or saved data keep legacy category values or use a compatibility mapping.

**Manual testing criteria**

- All six requested families appear in the intended order.
- The visible browse labels use the new natural wording.
- Existing add and placement flows still work after the catalog-family split.
- Old internal category ids do not leak into the main catalog UI.

## Step 2. Replace Large Cards With Compact Catalog Rows

**Goal**

Reduce the amount of vertical space each catalog group and module consumes.

**What is going to be implemented**

A denser catalog presentation where category headers are narrow rows and cabinet items are compact line-based entries instead of tall card blocks.

**Description**

The user's core complaint is not that the catalog is grouped. The problem is that each layer is too tall, so finding the next category or box requires too much scrolling. This step keeps the expandable structure but removes the heavy card treatment. Group headers should become slim list rows, and cabinet entries should read like a compact product finder: name first, dimensions and price secondary, action control at the edge.

**Required work**

- Replace the current large group containers and cabinet cards with a denser row-based layout.
- Reduce row padding, gaps, border radius, and decorative surface treatment so more entries fit in the same viewport.
- Keep cabinet names easy to scan even in the compact layout.
- Keep dimensions and price visible without forcing oversized multi-line cards.
- Retain an item-level add action and drag target in the tighter row layout.
- Ensure long names truncate cleanly instead of turning compact rows back into tall blocks.

**Manual testing criteria**

- The collapsed catalog shows substantially more category structure at once than the current UI.
- Cabinet items use meaningfully less height than the current card layout.
- Cabinet names, dimensions, and prices remain readable in the compact rows.
- Add and drag interactions still work from the denser list presentation.

## Step 3. Make Expand and Collapse Behavior Optimize for Fast Scanning

**Goal**

Ensure the nested catalog helps users find a cabinet faster instead of creating a long permanently expanded column.

**What is going to be implemented**

A more controlled accordion behavior, likely default-collapsed or single-open, with clear state indicators and predictable focus handling.

**Description**

The current default-open behavior is reasonable for three populated groups, but it works against the requested browsing style once the catalog grows to six families. The compact catalog should behave like a finder. Users should see the list of families first, then deliberately expand the one they want. Opening one family should not leave the rest of the tree stretched out unnecessarily.

**Required work**

- Change the initial open-state strategy so the full category list stays compact on first load.
- Prefer single-open accordion behavior so opening one family closes the previously open family.
- Keep clear visual state on each category row with a chevron, plus/minus, or similar cue.
- Preserve keyboard and screen-reader semantics such as `aria-expanded`.
- Keep the active or previewed family visible after add if that improves usability.
- Prevent layout jumps or lost scroll position when a family is toggled.

**Manual testing criteria**

- Opening one family does not leave multiple unrelated families expanded at the same time.
- Switching between families requires little scrolling.
- The open and closed state of each family is obvious.
- Toggling families does not break keyboard focus or the placement flow.

## Step 4. Populate the Six Requested Cabinet Families

**Goal**

Make the new catalog tree useful by filling it with the requested cabinet families and believable starter modules.

**What is going to be implemented**

Expanded starter catalog coverage for:

- base cabinets with doors
- base cabinets with drawers
- wall cabinets with doors
- lift-up wall cabinets
- tall cabinets
- corner cabinets

**Description**

The compact browse structure only solves half the problem. It also needs the right content underneath it. Some of the requested families map directly to what the app already knows how to render, while lift-up wall cabinets are a likely gap because the current front renderer only distinguishes drawers from standard hinged doors. This step broadens the starter catalog while keeping the plan honest about where new render behavior may be needed.

**Required work**

- Add starter modules under each of the six requested families.
- Use natural cabinet names that match the family wording instead of generic box phrasing.
- Keep dimensions, price, and stable ids on every new module.
- Reuse existing base, drawer, wall, tall, and corner defaults where they already fit.
- Add a new front-model path for lift-up wall cabinets, or document a temporary fallback if the visual difference is deferred.
- Keep item ordering inside each family predictable, such as by width or common usage.

**Manual testing criteria**

- Each of the six families contains visible starter items.
- Item names are understandable without internal jargon.
- Adding an item from any family creates the expected placed cabinet.
- Lift-up wall cabinets are either visually distinct or explicitly using a documented temporary fallback.

## Step 5. Align Selection Labels, Rendering, and Regression Coverage

**Goal**

Finish the feature so the new catalog wording and structure stay consistent across the planner.

**What is going to be implemented**

Downstream UI label updates plus automated coverage for the new family structure, compact rows, and any new lift-up front behavior.

**Description**

This feature is not done when the left panel looks better. The selected cabinet details, tests, and rendering assumptions must also line up with the new browse structure. Otherwise the app will still leak old terminology or silently regress back to the current broad grouping model. This last step keeps the change coherent and maintainable.

**Required work**

- Update selection and summary label helpers anywhere old family wording still appears to the user.
- Add catalog tests for family order, item grouping, and the new default expand-collapse behavior.
- Add component tests for row rendering and accordion interaction if the current test setup supports them.
- Add render-model tests for any new lift-up wall-cabinet front type.
- Verify that placed cabinets keep the correct item identity after selection, movement, and repeated adds.
- Document any compatibility rule needed for legacy fixtures or saved project data.

**Manual testing criteria**

- The cabinet chosen in the catalog shows consistent naming in the selection panel after placement.
- Automated tests cover the new family structure instead of depending on the old labels.
- Future catalog additions can be slotted into one of the six families without redesigning the catalog UI again.
