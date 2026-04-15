# Incremental Implementation Plan Magnetic Wall Placement

This plan assumes the current prototype already has:

- wall-aware placement and move validation centered in `src/features/cupboards/model/placement.js`
- live preview and move updates routed through `src/features/cupboards/state/cupboardReducer.js`
- invalid-state rendering already available through `src/features/cupboards/components/CupboardRenderer.jsx` and `src/features/cupboards/lib/cabinetAppearance.js`

The 2 steps below focus specifically on the requested magnetic same-wall behavior: keep the dragged cabinet locked to the last flush valid position for a small pointer buffer, then switch to a red invalid overlap state only after that buffer is exceeded.

## Step 1. Add a Magnetic Same-Wall Snap Window to Placement Validation

**Goal**

Teach the placement model to distinguish between three states on the same wall: freely valid, magnetically held at the nearest flush edge, and truly invalid overlap.

**What is going to be implemented**

An extension of `validatePlacementCandidate` that computes the nearest valid edge-aligned position against neighboring cabinets and keeps that snapped position valid while the pointer only intrudes a small configurable distance past the edge.

**Description**

The current validator always turns the current wall-aligned pointer position directly into `snappedPosition`, then marks it invalid as soon as spans overlap. That is why the preview goes red immediately at first contact. The requested flow needs a small hysteresis layer in the placement math: when the user drags cabinet B into cabinet A by only a small mouse-distance buffer, cabinet B should stay rendered at the last valid touching position instead of following the pointer into overlap. Once the pointer crosses that buffer, the validator should stop holding the cabinet, report an overlap, and let the preview show the invalid red state.

The magnetic buffer should be a dedicated placement tolerance constant, not a physical cabinet gap. The final cabinet-to-cabinet distance should stay flush at `0`, while the pointer is allowed to overshoot by a small amount before the state becomes invalid.

**Required work**

- Add one explicit magnetic tolerance constant in `src/features/cupboards/model/placement.js` for same-wall pointer overshoot.
- Split same-wall validation into:
  - the raw wall-aligned candidate span from the pointer
  - the nearest flush valid span beside neighboring cupboards
  - the intrusion distance between the raw span and the blocked span
- Keep the candidate valid and return the flush neighbor-aligned `snappedPosition` when the intrusion stays within the magnetic tolerance.
- Return `OVERLAP` and the raw overlapped position once the intrusion exceeds the magnetic tolerance.
- Add metadata to the validation result that makes the state explicit, such as whether the candidate is magnetically snapped and which cupboard edge it is attached to.
- Keep corner-collision checks unchanged so the new behavior only affects same-wall magnetic attachment.

**Manual testing criteria**

- Dragging a new cabinet toward an existing cabinet on the back wall keeps the preview flush against the existing cabinet at first contact.
- Small continued pointer movement in the same direction does not immediately turn the preview red.
- Larger continued movement past the configured tolerance turns the preview red and keeps the drop invalid.
- Reversing back out of the overlap immediately restores the flush valid position.

## Step 2. Propagate Magnetic State Through Preview, Drop, and Regression Coverage

**Goal**

Make the new magnetic state visible and trustworthy in the live planner flow, including commit rules and tests.

**What is going to be implemented**

Reducer, messaging, and test updates so placement preview and cabinet move flows both honor the magnetic snap window, commit the held flush position while inside the buffer, and block drops once the buffer is exceeded.

**Description**

The controllers already stream pointer intersections into the reducer, and the reducer already trusts the validation result as the source of truth for preview position and move position. That means the main integration work is to carry the richer validation result through the existing state shape and make the UI reflect it correctly. Inside the safe buffer, the preview should remain valid and render at the closest attached position. After the buffer, the preview should become invalid and red, and `FINISH_PLACEMENT_PREVIEW` / `FINISH_CUPBOARD_MOVE` should continue refusing the commit.

This step should cover both placement preview and moving an existing cabinet, because both flows already share the same validator and would otherwise drift into different interaction rules.

**Required work**

- Update `src/features/cupboards/state/cupboardReducer.js` so preview and move state preserve the richer magnetic validation result without overriding it.
- Keep `PlacementPreviewController.jsx` and `CupboardMoveController.jsx` on the same pointer-stream path unless the new validator proves stateful behavior is required.
- Update stage messaging in `src/features/planner/lib/stageMessaging.js` to describe the held valid snap versus a true invalid overlap, if extra copy is needed.
- Confirm `CupboardRenderer.jsx` keeps normal ghost styling while the cabinet is magnetically held and only switches to red after the overlap tolerance is exceeded.
- Add model tests in `src/features/cupboards/model/placement.test.js` for:
  - valid magnetic hold at first contact
  - continued validity within the overshoot buffer
  - invalid overlap after the overshoot buffer
  - correct flush commit position when released inside the buffer
- Add reducer tests in `src/features/cupboards/state/cupboardReducer.test.js` to prove preview and move flows both use the same magnetic behavior.

**Manual testing criteria**

- Releasing the mouse while the preview is inside the magnetic buffer places the cabinet flush against its neighbor.
- Releasing the mouse after pushing past the magnetic buffer does not place the cabinet.
- The preview stays non-red while it is being magnetically held and becomes red only after the tolerance is exceeded.
- The same interaction works when moving an existing cabinet along the same wall, not only when placing a new one.
