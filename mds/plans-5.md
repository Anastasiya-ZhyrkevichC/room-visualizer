# Incremental Implementation Plan 5

This plan assumes the current prototype already has:

- a planner-style layout with a left catalog panel, 3D room shell, and right-side details area
- wall-aware cabinet placement for supported walls
- cabinet selection and basic scene interaction
- a small starter catalog that can add simple modules into the room

The 5 steps below focus specifically on a believable starter kitchen catalog. They split catalog credibility into smaller, visible improvements so the app can grow from a short demo list into a prototype-ready kitchen module library.

## Step 1. Replace Ad-Hoc Catalog Items With Stable Module Records

**Goal**

Turn the current starter list into a catalog where every visible item follows the same reliable data contract.

**What is going to be implemented**

A local catalog source where each module has a stable id, name, usage category, dimensions, and fixed prototype price.

**Description**

The current catalog may be enough for a demo, but it is not yet trustworthy enough for layout building, pricing, or later project save/load work. The first step is to make every module explicit and consistent. The user should stop seeing vague or uneven prototype items and instead see real module records with the same core information on every card.

**Required work**

- Create or refactor the local catalog data so every starter module has a stable id.
- Give every catalog item the same required fields: `name`, `category`, `width`, `height`, `depth`, and fixed prototype `price`.
- Normalize category names so they can support grouping and filtering later.
- Remove or rename generic placeholder entries that do not fit the new schema.
- Update the catalog card UI to show the key data clearly: name, dimensions, and price.
- Keep the existing add flow working for all visible items.

**Manual testing criteria**

- Every visible catalog item shows a real module name, dimensions, and fixed price.
- No generic placeholder items remain in the catalog UI.
- Adding any visible catalog item still creates a module in the room.
- Refreshing the page does not change how an existing catalog item is named or presented.

## Step 2. Group the Catalog Into a Nested Usage Tree

**Goal**

Make the catalog feel like a kitchen module library instead of one long flat list.

**What is going to be implemented**

A nested catalog tree or accordion grouped by cabinet usage, with modules shown as leaf items inside each section.

**Description**

Once the catalog grows beyond a few demo items, a flat list becomes hard to scan. This step introduces the structure the user asked for: a usage-based hierarchy. The grouping should match how people think about kitchen modules, such as base cabinets, drawer units, wall cabinets, tall units, and corner pieces.

**Required work**

- Replace the flat catalog list with grouped sections or a tree-style structure.
- Add meaningful top-level groups based on cabinet usage.
- Render actual cabinet modules as leaf items inside those groups.
- Keep an `Add` action available at the item level, not only at the group level.
- Show basic visual cues for the structure, such as expand/collapse state and item counts if useful.
- Choose sensible default-open groups so the catalog feels usable on first load.

**Manual testing criteria**

- The catalog is no longer presented as a single flat list.
- Cabinet items appear under the correct usage group.
- Expanding or collapsing groups does not break the add flow.
- The user can clearly distinguish base, drawer, wall, tall, and corner sections.

## Step 3. Expand Coverage Across Core Kitchen Module Families

**Goal**

Give the user enough module variety to build a believable first kitchen layout.

**What is going to be implemented**

A broader starter range that covers the main cabinet families with multiple realistic module options in each family.

**Description**

A believable catalog is not only about structure. It also needs enough useful content. This step expands the module set from a tiny demo range into a prototype-ready library with the common cabinet families users expect when laying out a kitchen. The target is not a full commercial catalog, but it should be broad enough to create layouts that feel plausible.

**Required work**

- Add a meaningful set of base cabinets with a few common widths.
- Add separate drawer-unit modules instead of treating them as the same as hinged base cabinets.
- Add wall-cabinet modules with realistic sizes for upper storage.
- Add tall units such as pantry or appliance-height cabinets.
- Add corner modules so the user can build L-shaped or corner-adjacent layouts more credibly.
- Add a small number of practical special-purpose modules if needed for realism, such as sink base, open shelf, filler, or appliance-ready units.
- Ensure every new module still follows the stable catalog schema from Step 1.

**Manual testing criteria**

- The catalog contains clear module groups for base, drawer, wall, tall, and corner cabinets.
- Each group includes more than one useful module option.
- Different module cards are visibly distinct by name and dimensions.
- The user can build a more realistic cabinet run without repeating only one or two generic boxes.

## Step 4. Add Search and Category Filtering for the Larger Catalog

**Goal**

Keep the expanded catalog fast to browse once the module count becomes meaningfully larger.

**What is going to be implemented**

A small discovery layer for the catalog, including search and category filtering that works with the nested tree.

**Description**

After the catalog becomes broader and more realistic, usability depends on quick discovery. Grouping alone is not enough once there are many items. This step adds the minimum finding tools the architecture already points toward: search plus category filtering. The goal is to help the user reach the right module quickly without flattening the catalog again.

**Required work**

- Add a search input that matches cabinet names and, if useful, category labels.
- Add category filtering that works with the usage groups already shown in the tree.
- Auto-expand matching groups or otherwise make matches easy to see.
- Show a clear empty state when no modules match the current search or filter.
- Keep add actions working from filtered and searched results.
- Make sure clearing the search or filter restores the full grouped catalog cleanly.

**Manual testing criteria**

- Typing into search narrows the visible catalog items.
- Applying a category filter limits the visible results to the expected cabinet family.
- Matching items remain easy to add from the filtered view.
- Clearing the active search and filter restores the full catalog tree.
- A no-results search shows a readable empty state instead of a broken panel.

## Step 5. Preserve Catalog Identity After a Module Is Added

**Goal**

Make catalog choices remain recognizable after placement so the user trusts what they are building.

**What is going to be implemented**

A catalog-backed add flow where placed modules keep a stable reference to the catalog item they came from, and the planner UI continues showing that identity.

**Description**

The catalog is not believable if items turn back into anonymous boxes after placement. When a user adds `Drawer base 600` or `Tall pantry 600`, that identity should still be visible in the planner. This step links the richer catalog data to placed instances so later pricing, persistence, and editing features can rely on the same stable source.

**Required work**

- Store the source catalog item id on each placed module.
- Preserve the placed module's visible identity from the catalog, including name and category.
- Show catalog-backed module details in the selection panel or scene label instead of generic box wording.
- Keep naming and dimensions consistent between the catalog card and the placed-module details.
- Make sure fixed prototype pricing stays attached to the correct catalog item reference for later summary work.
- Verify that adding the same catalog item multiple times creates separate instances without mixing up their shared source data.

**Manual testing criteria**

- After adding a module, the selected object still shows the same cabinet identity the user picked in the catalog.
- Different cabinet families remain distinguishable after placement.
- Re-adding the same module creates a new instance without corrupting other placed modules.
- The module details shown after placement stay consistent with the source catalog card.
