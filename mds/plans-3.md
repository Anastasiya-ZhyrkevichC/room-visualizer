# Incremental Implementation Plan 3

This plan assumes the current prototype already has:

- a planner-style layout
- a working 3D room shell with visible back and side walls
- a starter cabinet or kitchen box catalog in the left panel
- basic cabinet rendering in the 3D scene
- click selection for placed cabinets

The 5 steps below focus specifically on 3D scene interaction. They break drag-and-drop placement into smaller wall-aware behaviors so the implementation stays visible, testable, and stable.

## Step 1. Add Drag Preview From the Catalog Into the 3D Scene

**Goal**

Let the user start dragging a kitchen box from the catalog and see a live preview in the 3D room before placement.

**What is going to be implemented**

A drag flow that creates a temporary scene preview object while the pointer moves over the room.

**Description**

This is the foundation for all wall placement behavior. Do not place the final cabinet immediately on drag start. Instead, show a lightweight preview or ghost box that follows the pointer in the scene. This step is only about entering placement mode and rendering a live preview object.

**Required work**

- Allow drag start from a kitchen box item in the catalog.
- Enter a dedicated placement mode when dragging begins.
- Create a temporary preview cabinet in the 3D scene.
- Update the preview position as the pointer moves across the scene.
- Make the preview visually different from a placed cabinet, such as lower opacity or outline styling.
- Clear the preview cleanly when the drag is canceled or released outside a valid area.

**Manual testing criteria**

- Dragging a kitchen box from the catalog shows a preview object in the 3D scene.
- Moving the mouse changes the preview position continuously.
- The preview looks different from a fully placed cabinet.
- Canceling the drag removes the preview without leaving a broken object behind.

## Step 2. Support Back Wall Placement With Pointer-Based Positioning

**Goal**

Allow the user to drag a kitchen box onto the back wall and place it there with correct live positioning.

**What is going to be implemented**

A wall-targeted placement flow where the preview snaps onto the back wall and the final cabinet is created on drop.

**Description**

This step covers the first requested placement target: the back wall. The important part is that the preview should not float freely in the room. It should be constrained to the back wall plane so the user can understand exactly where the cabinet will be placed. When the mouse moves, the preview should move along that wall.

**Required work**

- Detect when the pointer is over the back wall during placement mode.
- Project the preview cabinet onto the back wall instead of letting it move freely in 3D space.
- Keep the cabinet aligned to the wall face with a stable default orientation.
- Clamp horizontal movement so the cabinet stays within the valid back-wall span.
- Place a real cabinet when the user drops on a valid back-wall position.
- Reject the drop when the pointer is not on a valid back-wall target.

**Manual testing criteria**

- Dragging onto the back wall shows the preview attached to that wall.
- Moving the mouse left or right changes the preview position on the back wall.
- Dropping on the back wall creates a placed cabinet in the shown position.
- Dropping outside the valid back-wall area does not create a cabinet.
- The placed cabinet renders flush against the back wall instead of floating away from it.

## Step 3. Support Side Wall Placement With Wall-Aware Orientation

**Goal**

Allow the user to drag a kitchen box onto a side wall and place it there with the correct rotation and movement constraints.

**What is going to be implemented**

Placement on the left or right side wall with orientation adjusted to match the selected wall.

**Description**

Side-wall placement should be treated as a separate feature from back-wall placement because the wall normal, cabinet orientation, and movement axis are different. The preview should rotate automatically for the side wall so the kitchen box looks intentionally attached to that wall instead of reusing the back-wall transform unchanged.

**Required work**

- Detect when the placement pointer is over a supported side wall.
- Snap the preview cabinet to the side wall plane.
- Rotate the preview and final cabinet so they face correctly relative to that wall.
- Constrain movement along the valid side-wall axis.
- Reuse the same valid-drop and invalid-drop behavior from back-wall placement.
- Keep the wall targeting logic explicit so back and side walls do not fight each other.

**Manual testing criteria**

- Dragging onto a side wall shows the preview attached to that wall.
- Moving the mouse changes the preview position along the side wall.
- Dropping on the side wall creates a cabinet in the shown location.
- The side-wall cabinet has a correct wall-facing orientation after placement.
- Returning to the back wall still works after side-wall placement is added.

## Step 4. Reposition a Placed Kitchen Box by Dragging Along the Wall

**Goal**

Let the user select an existing kitchen box and move it along its current wall with direct mouse interaction.

**What is going to be implemented**

Drag-to-move behavior for already placed cabinets, constrained to the wall they are attached to.

**Description**

The requested behavior is not complete if drag and drop only works for initial creation. Once a cabinet is placed, the user should be able to select it and drag it to a new position on the same wall. This keeps the interaction model consistent: mouse movement changes box position in real time, and the cabinet remains wall-aligned while moving.

**Required work**

- Allow the user to select a placed kitchen box in the scene.
- Start move mode when the selected cabinet is dragged.
- Keep the cabinet constrained to its attached wall while moving.
- Update the cabinet position continuously as the mouse moves.
- Preserve wall alignment and orientation during movement.
- Commit the new position on release and restore the previous position if the move ends in an invalid state.

**Manual testing criteria**

- A placed cabinet can be selected directly in the scene.
- Dragging a selected cabinet changes its position in real time.
- The cabinet stays attached to its wall while moving.
- Releasing the mouse keeps the cabinet in the new valid position.
- Invalid moves do not leave the cabinet in a broken or floating state.

## Step 5. Add Placement Validation and Scene Feedback for Real Usability

**Goal**

Make wall placement reliable by showing users when a drag target is valid, blocked, or out of bounds.

**What is going to be implemented**

Visual validation feedback for wall bounds, collisions, and invalid drop targets.

**Description**

Without validation, drag placement will feel unpredictable. This step adds the minimum scene feedback required to make the previous steps usable in practice. The user should be able to tell whether the current pointer position is valid before dropping the cabinet.

**Required work**

- Detect when a cabinet would extend beyond the available wall bounds.
- Detect overlap with another cabinet on the same wall if collision handling already exists or can be added simply.
- Change the preview state when placement is invalid, such as red tint or warning outline.
- Prevent invalid placements from being committed.
- Show a small readable status message or hint for invalid placement.
- Keep valid placement feedback lightweight and immediate.

**Manual testing criteria**

- Moving a preview outside wall bounds switches it into an invalid state.
- Dropping in an invalid position does not create or move a cabinet.
- Overlapping another cabinet is blocked if collision validation is enabled in this step.
- Returning the preview to a valid area restores the valid visual state.
- The user can understand from the scene feedback whether the drop will succeed before releasing the mouse.
