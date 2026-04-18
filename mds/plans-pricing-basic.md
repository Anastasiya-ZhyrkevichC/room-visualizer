# Incremental Implementation Plan Pricing Basic

This plan assumes the current prototype already has:

- a planner-style layout with a left catalog panel, 3D room shell, and right-side details area
- a believable starter catalog with stable module ids, names, dimensions, categories, and fixed prototype prices
- wall-aware cabinet placement plus cabinet selection and delete flows
- placed cabinets keeping a stable reference to the catalog item they came from

The 2 steps below condense the original pricing plan into one step for live planner pricing and one step for export/import pricing integrity, without dropping the key product requirements.

## Step 1. Build One Shared Live Pricing Flow in the Planner

**Goal**

Create a trustworthy live pricing experience inside the planner.

**What is going to be implemented**

One shared pricing model that drives a polished pricing summary block, stays in sync with room edits, and keeps non-price-changing actions from affecting totals.

**Description**

The planner should have a single source of truth for pricing before the UI starts depending on it. Every placed cabinet should resolve to one reliable line item and contribute to one shared total. That same shared pricing flow should power a visible pricing card in the planner UI so the user sees a real feature instead of debug output. The pricing block should update immediately when cabinets are added, deleted, or replaced, while remaining unchanged when a cabinet is only moved, rotated, or selected. The copy should stay explicit that the number represents the current cabinet total only, not delivery, installation, or tax.

**Required work**

- Ensure every visible catalog item has a stable fixed price and currency.
- Keep the source catalog id on each placed cabinet instance.
- Derive one price line item per placed cabinet with instance id, readable display name, and current price.
- Compute the running total, object count, and empty state in one shared place instead of spreading pricing logic across components.
- Add a dedicated pricing summary card in the right panel or another consistently visible planner area.
- Show one row per placed object with a readable name and formatted price, plus one obvious `Total price` value.
- Make the block usable for larger layouts with stable line ordering, sensible spacing, scrolling, and readability on desktop and smaller laptop screens.
- Recalculate the list and total immediately when a cabinet is added, deleted, or replaced with a different module type.
- Keep the pricing block unchanged when a cabinet is only moved, rotated, or selected.
- Optionally link the list to scene selection by highlighting the matching line item and allowing line-item click-to-select.

**Manual testing criteria**

- Adding one cabinet creates one pricing line item and updates the total immediately.
- Deleting a cabinet removes its pricing line item and updates the total immediately.
- Replacing a cabinet updates the visible name, price, and total.
- Selecting, rotating, or moving a cabinet does not create duplicate entries or change the total.
- Adding many objects keeps the layout usable and does not push the total out of view.
- With no cabinets placed, the planner shows a clean zero-state with a zero total instead of blank or broken UI.

## Step 2. Preserve Exported Prices and Reconcile Imported Projects

**Goal**

Keep pricing trustworthy when projects are exported, imported, and compared against a newer catalog.

**What is going to be implemented**

An export-time pricing snapshot plus import-time repricing that compares saved prices against the current catalog, warns about drift, and handles unavailable modules clearly.

**Description**

An exported project should keep the exact visible pricing line items and total that the user saw at export time, even if the catalog changes later. That snapshot is historical reference data, not a live pointer to future prices. When an older project is imported into a newer catalog, the app should calculate a new live total, compare it against the saved snapshot, and explain any difference instead of silently repricing the project. If a source module no longer exists, the UI should mark it as unavailable and keep the recalculated total in a partial or unresolved state until the user fixes it.

**Required work**

- Store the visible pricing line items, total, and enough metadata for later comparison when exporting a project.
- Keep the exported pricing snapshot deterministic, easy to inspect, and unchanged until the user exports again.
- Refresh the stored snapshot when the user re-exports after edits or catalog price changes.
- Keep the UI wording clear about what is live pricing and what is the export-time snapshot.
- On import, compare saved snapshot prices against the current live catalog on a per-item basis.
- Show a visible message when the live total differs from the exported snapshot total.
- Keep the old exported prices visible as reference after import.
- Mark modules as unavailable when their source catalog item no longer exists.
- Show a partial or unresolved total state when unavailable modules prevent a full live recalculation.
- Give the user a clear path to review, replace, or remove unavailable items, and prevent silent repricing with no explanation.

**Manual testing criteria**

- Exporting a project stores the same line items and total the user saw on screen at export time.
- Changing catalog prices later does not modify an already exported file.
- Re-exporting after a price change creates a new snapshot that reflects the new prices.
- Importing an older project after a catalog update shows a price-change warning, the old snapshot as reference, and a new live total.
- Importing a project with a removed module marks that module as unavailable and shows the total as partial or unresolved until the issue is fixed.
- Replacing or removing unavailable items restores a clean live total state.
