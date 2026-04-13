# Incremental Implementation Plan 6

This plan assumes the current prototype already has:

- a planner-style layout with a left catalog panel, 3D room shell, and right-side details area
- a believable starter catalog with stable module ids, names, dimensions, categories, and fixed prototype prices
- wall-aware cabinet placement plus cabinet selection and delete flows
- placed cabinets keeping a stable reference to the catalog item they came from

The 5 steps below focus specifically on live pricing summary. They start with a visible pricing block in the planner UI and then extend pricing so it remains trustworthy when projects are exported, imported, and repriced against a newer catalog.

## Step 1. Add a Stable Pricing Model for Placed Cabinets

**Goal**

Make pricing deterministic before the UI starts depending on it.

**What is going to be implemented**

A single pricing data flow where every placed cabinet can produce one reliable price line item and one shared total summary.

**Description**

Before the pricing block is shown to the user, the app needs a clear source of truth for pricing. The room scene, catalog, and right panel should not each calculate prices in their own way. This step creates the pricing foundation so later UI work stays simple and trustworthy.

**Required work**

- Ensure every visible catalog item has a stable fixed price and currency.
- Keep the source catalog id on each placed cabinet instance.
- Derive a price line item for each placed cabinet with instance id, display name, and current price.
- Compute the running room total in one shared place instead of spreading the logic across components.
- Define the empty pricing state for rooms with no placed cabinets.
- Keep non-price-changing actions such as selection, rotation, and movement from creating duplicate or stale pricing records.

**Manual testing criteria**

- Adding one cabinet creates one pricing line item.
- Deleting a cabinet removes its pricing line item.
- Selecting, rotating, or moving a cabinet does not create extra pricing entries.
- With no cabinets placed, the pricing model returns a zero total and a clean empty state.

## Step 2. Build a Good-Looking Pricing Summary Block

**Goal**

Show a pricing block that already feels like a real planner feature instead of temporary debug output.

**What is going to be implemented**

A polished summary card that lists placed objects, shows their prices, and presents the total price clearly.

**Description**

This is the main requested feature. The user should see a visually clear pricing block with a proper title, readable object rows, formatted prices, and one obvious total. Keep the copy explicit so it is clear that the number represents the current cabinet total only, not delivery, installation, or tax.

**Required work**

- Add a dedicated pricing summary card in the right panel or another consistently visible planner area.
- Show one row per placed object with a readable cabinet name and formatted price.
- Show the total object count in the block header or summary area.
- Show a primary `Total price` value with clear currency formatting.
- Add a clean empty state for rooms with no priced objects.
- Make the list usable for longer layouts with sensible spacing, scroll behavior, and hierarchy.
- Keep the block readable on desktop and smaller laptop screens.

**Manual testing criteria**

- The planner shows a clearly visible pricing block instead of raw text.
- Each placed cabinet appears in the list with its name and price.
- The total price is easy to find at a glance.
- Adding many objects does not break the layout or push the total out of view.
- An empty room shows a deliberate zero-state instead of a broken or blank card.

## Step 3. Keep the Pricing Block Live and Scene-Aware

**Goal**

Make the pricing summary update immediately during normal planner editing.

**What is going to be implemented**

A live pricing flow that stays in sync with cabinet add, delete, and replace actions while remaining stable during non-pricing edits.

**Description**

Once the pricing block exists, it has to behave like live product value, not a static report. The list and total should change immediately when the room contents change. At the same time, actions that do not affect price should leave the pricing block untouched. This step can also improve usability by linking the line-item list to the selected object in the scene.

**Required work**

- Recalculate the price list and total immediately when a cabinet is added.
- Recalculate the price list and total immediately when a cabinet is deleted.
- Update the affected line item and total when a cabinet is replaced with a different module type.
- Keep the pricing block unchanged when a cabinet is only moved, rotated, or selected.
- Keep line items in a stable order so the list does not jump unpredictably.
- Highlight the matching line item when a cabinet is selected, and optionally allow clicking a line item to select the cabinet in the scene.

**Manual testing criteria**

- Adding a cabinet updates the list and total immediately.
- Deleting a cabinet updates the list and total immediately.
- Replacing a cabinet with another module updates the visible name, price, and total.
- Moving or rotating a cabinet does not change the total price.
- The line-item list stays stable and does not duplicate rows after repeated edits.

## Step 4. Preserve a Price Snapshot in Exported Project Data

**Goal**

Make exported projects trustworthy even after the live catalog changes later.

**What is going to be implemented**

An export-time pricing snapshot that stores the visible line items and total exactly as they were when the project was exported.

**Description**

This step follows the pricing rules in the feature notes. If a customer exports a project today, that file should continue to represent today's prices even if the catalog changes tomorrow. The exported file is a snapshot, not a live pointer to future pricing.

**Required work**

- Store the visible pricing line items and total in the project data when exporting.
- Include enough metadata to compare the exported snapshot against a newer catalog later.
- Keep the exported pricing snapshot deterministic and easy to inspect.
- Treat the export snapshot as historical reference data, not something that mutates after export.
- Refresh the stored snapshot when the user exports the project again after edits or catalog price changes.
- Keep the UI wording clear about what is live pricing and what is export-time pricing.

**Manual testing criteria**

- Exporting a project stores the same prices the user saw on screen at export time.
- Changing local catalog prices later does not modify the already exported file.
- Re-exporting after a price change creates a new snapshot that reflects the new prices.
- The exported snapshot total matches the visible total at the moment of export.

## Step 5. Reprice Imported Projects and Handle Price Drift Cleanly

**Goal**

Show honest live pricing when an old project is imported into a newer catalog.

**What is going to be implemented**

Import-time repricing that compares the saved snapshot to current live prices, warns about changed prices, and handles unavailable modules without hiding the problem.

**Description**

This step covers the main edge cases from the essential features list. When a project is imported, the user should see the new live price and also understand that prices changed since export. If a module no longer exists in the current catalog, the UI should mark it as unavailable and make the recalculated total partial until the user resolves it.

**Required work**

- Compare imported snapshot prices against the current live catalog on a per-item basis.
- Show a visible message when the live total differs from the exported snapshot total.
- Keep the old exported snapshot visible as reference so the user can see what changed.
- Mark modules as unavailable when their source catalog item no longer exists.
- Show a partial or unresolved total state when unavailable modules prevent a full live recalculation.
- Give the user a clear path to resolve unavailable items, such as review, replace, or remove.
- Prevent silent repricing with no explanation.

**Manual testing criteria**

- Importing an older project after a catalog price update shows a price-change warning and a new live total.
- The old exported prices remain visible as reference after import.
- Importing a project with a removed module marks that module as unavailable.
- The total is shown as partial or unresolved until unavailable items are fixed.
- Replacing or removing unavailable items restores a clean live total state.
