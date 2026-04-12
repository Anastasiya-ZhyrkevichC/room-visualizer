# Small Incremental Plan

This plan does not try to finish the whole product in 5 steps. It focuses on small, useful features that move the project toward the long-term goal: a customer can shape a kitchen in the browser and understand what they are building.

The steps below are intentionally narrow:

- each step is visible in the web UI
- each step can be tested manually
- each step should feel finished on its own
- no internal automated test work is required for this plan

## Step 1. Clear Planner Layout

**Goal**

Turn the current prototype into a clean planner screen so the app already feels like a real tool.

**What is going to be implemented**

A basic workspace layout with:

- a top header
- a left room panel
- a large center 3D area
- a right info panel

**Description**

This step is only about structure. It does not add major planner behavior yet. It gives every future feature a stable place in the UI.

The left panel in this step should contain only the current basic room controls:

- `Length`
- `Width`
- `Height`
- one primary action button such as `Draw room` or `Apply`

**Expected work**

- Create a page layout for the planner.
- Move the existing room controls into a left sidebar.
- Keep the control set minimal in this step: `Length`, `Width`, `Height`, and one primary room action button.
- Reserve the right side for future object details and summary blocks.
- Keep the 3D room view as the main visual area.
- Add simple titles and empty states so the screen looks intentional.
- Make the layout readable on desktop and acceptable on a smaller laptop screen.

**Manual testing criteria**

- Opening the app shows a clear multi-panel planner layout.
- The 3D area remains visible and is the largest part of the screen.
- The left panel shows exactly these basic room controls: `Length`, `Width`, `Height`, and one primary room action button.
- The right panel shows a visible placeholder state instead of being empty or broken.

## Step 2. Better Room Setup

**Goal**

Let the user edit room dimensions in a more understandable and reliable way.

**What is going to be implemented**

A small room setup feature with clean inputs, validation, and apply/reset behavior.

**Description**

The room is the base of the whole planner. Before cabinets and pricing become useful, the user needs confidence that the room itself is correct.

**Expected work**

- Replace the raw dimension form with a cleaner room setup card.
- Keep only the core fields: length, width, and height.
- Add units directly in the labels.
- Add validation for empty, zero, and negative values.
- Add `Apply` and `Reset` actions.
- Show the updated room size in the 3D view after applying changes.

**Manual testing criteria**

- Changing the dimensions and clicking `Apply` updates the visible room.
- Invalid values show a readable validation message.
- Invalid values do not break the 3D scene.
- Clicking `Reset` restores the default dimensions.

## Step 3. Starter Cabinet Catalog

**Goal**

Replace generic box actions with a small starter catalog that looks like kitchen planning.

**What is going to be implemented**

A left-panel catalog with a few cabinet cards and a simple add action.

**Description**

This is the first step where the product starts to look like a kitchen constructor. The catalog can stay very small. The point is to show real module names instead of abstract boxes.

**Expected work**

- Create a small static list of cabinet modules.
- Show them as simple cards with name and size.
- Add a visible `Add` action for each card.
- Remove or hide the current generic box button list.
- When a module is added, place it into a predictable position in the room.
- Show a small success signal in the UI, such as selection, highlight, or a message.

**Manual testing criteria**

- The user sees cabinet options instead of generic `Box` buttons.
- Clicking `Add` creates a visible module in the room.
- Adding different cards results in visibly different cabinet labels or types in the UI.
- Adding a second cabinet still works and does not confuse the user.

## Step 4. Selected Cabinet Actions

**Goal**

Let the user interact with one placed cabinet in a simple, useful way.

**What is going to be implemented**

A small selection panel with only a few basic actions for the currently selected cabinet.

**Description**

This step should stay small. It does not need a full inspector. It only needs enough editing to make the placed cabinet feel like a real object the user can work with.

**Expected work**

- Allow clicking a cabinet in the scene to select it.
- Add a visible selected state in the 3D view.
- Show selected cabinet info in the right panel.
- Add a `Rotate` action.
- Add a `Delete` action.
- Optionally add one simple move action if it is easy to keep stable.

**Manual testing criteria**

- Clicking a cabinet marks it as selected.
- The right panel changes when a cabinet is selected.
- Clicking `Rotate` visibly changes the selected cabinet.
- Clicking `Delete` removes the selected cabinet from the room.
- The app returns to a clean empty-state panel when no cabinet is selected.

## Step 5. Simple Live Price Summary

**Goal**

Start delivering the main product value: visible pricing while the customer builds.

**What is going to be implemented**

A small price block that shows the current cabinet list and subtotal.

**Description**

This step should stay simple. It does not need a full pricing engine yet. It only needs fixed prices for the starter catalog and a visible subtotal that updates when cabinets are added or removed.

**Expected work**

- Add a fixed price to each starter cabinet type.
- Show a price summary block in the right panel or header.
- List the added cabinets with their individual prices.
- Show a running subtotal.
- Update the summary immediately when a cabinet is added or deleted.
- Keep the copy explicit and simple so the user understands what is included.

**Manual testing criteria**

- Adding a cabinet increases the subtotal.
- Deleting a cabinet decreases the subtotal.
- The summary shows which cabinets are included in the price.
- Refreshing selection or rotating a cabinet does not break the price block.
- If no cabinets are placed, the summary shows an empty state or zero subtotal.
