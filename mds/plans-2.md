# Incremental Implementation Plan 2

This plan assumes the current prototype already has:

- a planner-style layout
- room dimension editing with validation
- a working 3D room shell
- temporary quick-add cupboard actions

The 5 steps below continue from that baseline. They are intentionally small, visible in the web UI, and focused on product behavior rather than visual polish.

## Step 1. Replace Quick Add With a Starter Cabinet Catalog

**Goal**

Turn the temporary prototype actions into a small but real kitchen module catalog.

**What is going to be implemented**

A left-panel catalog with a short static list of cabinet modules, each with a name, size, and `Add` action.

**Description**

This step makes the app feel like a kitchen planner instead of a 3D box demo. Keep the catalog intentionally small, such as 4 to 6 cabinet types. Use static local data for now. The main outcome is that users choose named modules from a clear catalog instead of clicking generic prototype buttons.

**Required work**

- Create a local cabinet catalog structure with stable ids, names, sizes, and categories.
- Replace the current quick-add button group with catalog cards or a compact list.
- Show the most important data on each item: cabinet name, dimensions, and optional short category label.
- Add a visible `Add` action for each item.
- Place newly added cabinets in a predictable default position in the room.
- Show immediate UI feedback after add, such as auto-selection or a small status message.

**Manual testing criteria**

- The left panel shows cabinet modules instead of generic quick-add buttons.
- Clicking `Add` on a cabinet creates a visible module in the room.
- Different catalog items are visibly different in the UI by name and/or size.
- Adding multiple cabinets works without refreshing the page.

## Step 2. Add a Selected Cabinet Inspector

**Goal**

Make one placed cabinet editable through a simple, explicit right-side inspector.

**What is going to be implemented**

A selection flow where clicking a cabinet selects it and the right panel shows cabinet details with a few safe actions.

**Description**

This step should stay narrow. The user does not need a full CAD-style property editor yet. They only need enough control to understand that modules are real editable objects. The inspector should show the selected cabinet identity and expose a small action set.

**Required work**

- Allow the user to select a cabinet directly in the 3D scene.
- Add a clear selected state in the scene.
- Show selected cabinet details in the right panel.
- Add `Rotate 90°` for the selected cabinet.
- Add `Delete` for the selected cabinet.
- Add an empty state in the right panel when nothing is selected.

**Manual testing criteria**

- Clicking a cabinet marks it as selected.
- The right panel updates to show the selected cabinet.
- Clicking `Rotate 90°` changes the selected cabinet orientation in the scene.
- Clicking `Delete` removes the selected cabinet.
- When nothing is selected, the right panel returns to a clean empty state.

## Step 3. Add Simple Placement Controls With Bounds Feedback

**Goal**

Let the user reposition the selected cabinet in a controlled way without introducing hard-to-debug freeform dragging.

**What is going to be implemented**

Basic placement controls for the selected cabinet plus visible feedback when a move would place it outside the valid room area.

**Description**

This step should prefer reliability over fancy interaction. A good v1 approach is to keep cabinets aligned to one wall and let the user move them with explicit controls such as left/right step buttons or a position slider. Add room-bounds validation so the module cannot disappear outside the room.

**Required work**

- Add one simple movement control for the selected cabinet, such as step buttons or a horizontal position slider.
- Keep placement constrained to a defined wall or axis.
- Prevent moves that would push the cabinet outside the room bounds.
- Show visible feedback when a requested move is blocked.
- Keep the selected cabinet highlighted while it is being adjusted.
- Update the inspector with the current position value.

**Manual testing criteria**

- The selected cabinet can be moved through the UI without creating a new cabinet.
- Moving the cabinet updates its visible position in the room.
- Trying to move the cabinet outside the room is blocked.
- The UI shows a readable message or state when a move is invalid.
- Valid moves do not break selection or scene rendering.

## Step 4. Add a Live Price Summary

**Goal**

Start delivering the product's core value: transparent pricing while the kitchen is being built.

**What is going to be implemented**

A visible summary block that lists placed cabinets and shows a running subtotal based on fixed catalog prices.

**Description**

This does not need a full pricing engine yet. Use fixed prices on the starter catalog items and calculate a deterministic subtotal on the client. The important part is that users can see which cabinets are included and how the total changes as they edit the room contents.

**Required work**

- Add a fixed price to each starter catalog item.
- Create a visible price summary area in the right panel or top bar.
- Show each placed cabinet as a line item with name and price.
- Show a subtotal for all placed cabinets.
- Update the summary immediately when a cabinet is added or deleted.
- Keep the summary readable when the room is empty.

**Manual testing criteria**

- Adding a cabinet increases the subtotal.
- Deleting a cabinet decreases the subtotal.
- The price summary lists the cabinets currently in the room.
- Rotating or selecting a cabinet does not corrupt the price summary.
- With no cabinets placed, the summary shows an empty state or zero subtotal.

## Step 5. Add Browser Draft Persistence With Import/Export UI

**Goal**

Protect user progress and make the planner usable across refreshes without introducing backend storage.

**What is going to be implemented**

A top project bar with `New`, `Import`, and `Export`, plus browser-local autosave and a restore-draft flow.

**Description**

This step turns the prototype into a safer tool. It follows the architecture direction already described in the docs: browser-local autosave for the working draft and explicit JSON import/export for a portable project file. Keep the messaging clear so the user understands what is stored in the browser and what is exported as a file.

**Required work**

- Add a top project bar with project name and basic status text.
- Autosave meaningful planner state changes to `localStorage`.
- Restore the saved draft after refresh or reopen.
- Add `Export` to download the current project as JSON.
- Add `Import` to load a previously exported JSON file.
- Add a confirmation flow for replacing the current project with imported data or starting a new project.

**Manual testing criteria**

- Refreshing the page restores the last working draft.
- Clicking `Export` downloads a JSON file.
- Importing an exported file restores the same room and cabinet state.
- Clicking `New` clears the current plan only after confirmation.
- The status text makes it clear that the working draft is stored in the browser.
