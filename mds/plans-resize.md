# Incremental Implementation Plan Resize

This plan assumes the current prototype already has:

- variable-width starter cabinet definitions in `src/features/cupboards/model/catalog.js`
- shared wall-aware placement validation in `src/features/cupboards/model/placement.js`
- selected-cabinet width controls rendered in-scene through `src/features/cupboards/components/SelectedCupboardWidthControls.jsx`
- drag-to-move interaction for placed cabinets through `src/features/room/components/CupboardMoveController.jsx`

## Current implementation check

- `SelectedCupboardWidthControls.jsx` currently renders two clickable arrow buttons above the selected cabinet. The interaction is discrete click-to-step, not drag-to-resize.
- `STEP_SELECTED_CUPBOARD_WIDTH` in `src/features/cupboards/state/cupboardReducer.js` delegates to `getCupboardWidthStepOutcome`, which only accepts a resize when the resized cabinet keeps the same wall-span center. That means width changes expand or shrink around the center instead of keeping the opposite side fixed.
- `getCupboardWidthStepOutcome` already reuses placement validation, so bounds and collision checks exist, but they are wired around center-preserving resizing rather than edge-anchored resizing.
- `CupboardMoveController.jsx` already owns the pointermove and pointerup lifecycle for dragging a placed cabinet along its wall, but there is no parallel resize mode or resize-handle drag controller yet.
- The catalog still exposes supported widths as discrete variants, so drag-based resizing should snap to the nearest valid supported width rather than inventing arbitrary continuous cabinet sizes.

The 2 steps below focus specifically on the requested behavior: drag the left or right side of a selected cabinet, resize in both directions, and keep the opposite side fixed while the current validation rules continue to protect room bounds and collisions.

## Step 1. Add an Edge-Anchored Resize Model for Left and Right Sides

**Goal**

Make left-side and right-side resizing first-class operations so width changes keep the opposite edge fixed instead of keeping the cabinet center fixed.

**What is going to be implemented**

A shared resize helper and reducer flow that convert a dragged handle into the nearest valid supported width while anchoring the opposite cabinet edge on the current wall.

**Description**

The main architectural change is in the placement model, not the UI. Today the width-step code validates a new variant and only accepts it if the snapped center stays unchanged. That is the opposite of the requested behavior. The resize logic should instead work from cabinet edges. When the user drags the left handle, the right edge should remain fixed and only the left edge should move. When the user drags the right handle, the left edge should remain fixed and only the right edge should move.

Because the cabinet catalog already defines supported widths as discrete variants, the drag gesture should still resolve to those variants. The pointer movement should be translated into a desired wall-span length, then snapped to the nearest valid supported width in the dragged direction. The resulting candidate cabinet should reuse the existing validation path so overlap, corner collision, and wall-bounds rules stay centralized.

**Required work**

- Introduce explicit resize-side semantics in the placement model, with UI-facing `left` and `right` handles normalized to wall-span `start` and `end` internally.
- Replace or extend `getCupboardWidthStepOutcome` so it can compute an edge-anchored resize outcome instead of requiring the wall-span center to stay unchanged.
- Reuse the existing wall-span helpers in `placement.js` to keep one edge fixed and recompute the resized cabinet center and snapped position for back, left, and right walls.
- Map drag distance along the wall axis to the nearest supported width variant for the selected cabinet, so resizing can both enlarge and shrink without leaving the catalog's valid size set.
- Add dedicated reducer and provider actions for resize mode, such as `START_CUPBOARD_RESIZE`, `UPDATE_CUPBOARD_RESIZE`, `FINISH_CUPBOARD_RESIZE`, and `CANCEL_CUPBOARD_RESIZE`.
- Preserve the original cupboard state while resize is active so invalid release or Escape can restore the starting width cleanly.

**Manual testing criteria**

- Dragging the left side outward enlarges the cabinet while the right side stays in the same world position.
- Dragging the left side inward shrinks the cabinet while the right side stays in the same world position.
- Dragging the right side outward or inward behaves symmetrically, with the left side staying fixed.
- Resizing snaps only to supported cabinet widths, not arbitrary freeform dimensions.
- Invalid enlargement into a wall limit or neighboring cabinet is blocked by the shared validation logic.

## Step 2. Replace Click Arrows With Draggable In-Scene Resize Handles

**Goal**

Let the user resize directly from the cabinet edges in the 3D scene instead of clicking width-step buttons.

**What is going to be implemented**

Selected-only draggable resize handles plus a pointer controller that streams wall intersections into the new resize state and updates the cabinet live during the drag.

**Description**

The current width controls already prove that the selected cabinet can host in-scene controls, but the interaction has to change from click buttons to drag handles. The cleanest implementation is to replace the button-like arrows with left and right edge grips positioned on the selected cabinet. On pointer down over a grip, the app should enter resize mode for that side and start listening to pointer movement on the active wall plane. During the drag, the cabinet should update continuously to the nearest valid supported width, using the edge-anchored logic from Step 1.

This controller can mirror the structure of `CupboardMoveController.jsx`, or both move and resize can be folded into one shared wall-drag controller if that produces less duplicated event handling. The important rule is that move mode and resize mode must be mutually exclusive so dragging a handle never starts whole-cabinet movement by accident.

**Required work**

- Replace the click-only controls in `SelectedCupboardWidthControls.jsx` with visible drag handles attached to the selected cabinet's left and right edges.
- Add a resize drag controller, or generalize `CupboardMoveController.jsx`, so resize mode receives pointermove, pointerup, and Escape handling on the active wall.
- Start resize mode from handle pointer-down, capture which side is active, and feed wall intersections into the new resize reducer actions.
- Keep resize feedback live in the scene, including invalid-state rendering when the dragged width cannot be committed.
- Update planner copy in files such as `src/features/planner/lib/roomFormatting.js` and `src/features/planner/lib/stageMessaging.js` so the app tells the user to drag side handles rather than click arrows.
- Add regression coverage for handle rendering, edge-anchored resize math, drag updates, invalid release behavior, and the interaction boundary between move mode and resize mode.

**Manual testing criteria**

- Selecting a cabinet shows left and right resize handles in the scene.
- Dragging a handle updates the cabinet width live as the pointer crosses supported-width thresholds.
- Dragging a resize handle never starts whole-cabinet move mode.
- Releasing on a valid width commits the resize, while Escape or invalid release restores the original width.
- The same drag-resize behavior works for cabinets attached to the back, left, and right walls.
