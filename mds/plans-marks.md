# Technical Plan: Cabinet Width Information In The 3D Scene

This plan describes how to expose the width of rendered cabinets directly inside the 3D room view instead of only in the right-side inspector.

## Step 1. Add an in-scene cabinet width overlay that follows the rendered cabinet geometry

**Goal**

Render width information in the 3D scene for the cabinet the user is actively working with, so width is visible during selection, placement preview, movement, and resizing without requiring the user to look away from the scene.

**Why this fits the current codebase**

- Cabinet width already exists in the domain model as both `cupboard.width` in millimeters and `cupboard.size[0]` in meters.
- Placed cabinets and preview cabinets already render through a single path:
  - `src/features/room/components/RoomShell.jsx`
  - `src/features/cupboards/components/CupboardRenderer.jsx`
  - `src/features/cupboards/components/CupboardMesh.jsx`
- Selection-only editing already exists in-scene through `SelectedCupboardWidthControls.jsx`, so adding another scene-level overlay next to that control follows the current interaction model.
- `@react-three/drei` is already installed, so the feature can use `Text`, `Billboard`, and optionally `Line` without adding dependencies.

**Implementation outcome**

Add a dedicated `CupboardWidthOverlay` scene component that renders a dimension line and a readable width label for:

- the selected placed cabinet
- the active placement preview cabinet
- the actively resized cabinet while its width changes
- the actively moved cabinet if it is selected

To keep the scene readable, do not show persistent width labels for every cabinet in v1. The default display policy should be "active cabinet only". That matches the current product pattern where detailed state is concentrated on the selected object and avoids label clutter in multi-cabinet layouts.

**Technical design**

1. Create a new component, for example `src/features/cupboards/components/CupboardWidthOverlay.jsx`.
   Responsibilities:
   - accept `position`, `rotation`, `size`, `widthMm`, `isGhost`, `isInvalid`, and `isActive`
   - render a width measurement line in cabinet-local coordinates
   - render a camera-facing width label above the cabinet
   - avoid pointer interaction so it cannot interfere with cabinet selection, moving, or resizing

2. Keep the overlay mounted as a sibling of `CupboardMesh`, not as a child inside the clickable cabinet mesh body.
   Reason:
   - `CupboardMesh` currently owns pointer handlers for move/select
   - the width overlay should be visually attached to the same cabinet transform, but it should not become part of the click target
   - a sibling group with no pointer handlers is the lowest-risk integration path

3. Reuse cabinet-local coordinates instead of computing world-space width manually.
   Recommended geometry:
   - parent overlay group uses the same `position` and `rotation` as the rendered cabinet
   - measurement start point: `[-size[0] / 2, labelY, size[2] / 2 + frontOffset]`
   - measurement end point: `[size[0] / 2, labelY, size[2] / 2 + frontOffset]`
   - label anchor point: `[0, labelY + labelLift, size[2] / 2 + frontOffset]`

   Why this is important:
   - `size[0]` is the canonical cabinet width in local cabinet space
   - this remains correct for back-wall, left-wall, and right-wall cabinets because the parent group rotation already handles world orientation
   - this avoids mixing cabinet width with room footprint width, which changes after rotation and is used for placement validation rather than dimension display

4. Add a small formatting helper for scene labels.
   Example helper location:
   - `src/features/cupboards/lib/formatWidthLabel.js`
   Behavior:
   - prefer `cupboard.width` when it is a finite number
   - otherwise derive width from `convertMetersToMillimeters(size[0])`
   - round to the nearest integer and format as `"600 mm"`

5. Add a small visibility policy helper to keep `CupboardRenderer` simple.
   Example behavior:
   - show overlay for `selectedCupboard`
   - show overlay for `placementPreview`
   - if `activeResize?.cupboardId === cupboard.id`, keep overlay visible and update it live
   - if `activeMove?.cupboardId === cupboard.id`, keep overlay visible while moving
   - hide overlay for non-selected idle cupboards

**Scene rendering details**

- Use `Billboard` plus `Text` from `@react-three/drei` for the label so the text remains readable from common camera angles.
- Render the measurement line with either:
  - `Line` from `@react-three/drei`, or
  - thin box meshes if the team wants to avoid another Drei primitive in tests
- Render two short end caps at the left and right measurement endpoints so the element reads like a dimension indicator instead of a floating underline.
- Place the line slightly in front of the cabinet front face using a small `frontOffset`, so it does not z-fight with the cabinet mesh.
- Place the label above the line using a small `labelLift`, so the text does not overlap resize handles.
- Keep overlay scale stable enough to read at current default camera distance in `RoomCanvas.jsx`.
- Set `depthWrite={false}` on decorative materials when appropriate to reduce flicker.

Suggested constants inside the new component:

- `DIMENSION_FRONT_OFFSET = 0.12`
- `DIMENSION_Y_OFFSET = 0.46`
- `DIMENSION_LABEL_LIFT = 0.12`
- `DIMENSION_CAP_HEIGHT = 0.08`
- `DIMENSION_TEXT_FONT_SIZE = 0.09`

These values are intentionally small because cabinet sizes are stored in meters.

**Color and state rules**

Match the existing visual language already used by outlines and resize handles.

- Selected or active valid cabinet:
  - warm highlight color aligned with current resize-handle accent tones
- Ghost placement preview:
  - lighter translucent treatment
- Invalid preview or invalid resize state:
  - use the same invalid family as the current red/orange invalid feedback

This keeps the width overlay visually consistent with:

- `src/features/cupboards/lib/cabinetAppearance.js`
- `src/features/cupboards/components/SelectedCupboardWidthControls.jsx`
- `src/features/cupboards/components/CupboardMesh.jsx`

If needed, centralize overlay colors in `cabinetAppearance.js` instead of hardcoding them in the new overlay component.

**State and data flow**

No reducer changes should be required for the first implementation.

Current width sources already exist:

- placed cupboard:
  - `cupboard.width`
  - `cupboard.size[0]`
- preview cupboard:
  - `placementPreview.width`
  - `placementPreview.size[0]`
- active resize:
  - the reducer already updates the actual cupboard object during drag through `UPDATE_CUPBOARD_RESIZE`
  - this means the overlay can read the latest width directly from the cupboard state without introducing a second transient width state

Important behavior during resize:

- `cupboardReducer.js` already swaps in the nearest supported width variant while dragging
- therefore the overlay should update automatically as React re-renders the selected cupboard
- the label should display the snapped variant width, not the raw pointer distance

That behavior is preferable because it matches the actual catalog module that would be committed if the drag ends successfully.

**Exact integration points**

1. `src/features/cupboards/components/CupboardRenderer.jsx`
   Add conditional rendering for `CupboardWidthOverlay`.

   Recommended structure:
   - for each placed cupboard, render `CupboardMesh`
   - then render `CupboardWidthOverlay` only when the cupboard matches the active visibility policy
   - keep `SelectedCupboardWidthControls` where it is, because those controls solve resizing input and the new overlay only solves information display
   - for `placementPreview`, render `GhostCupboardMesh` plus a ghost overlay using the preview state

2. `src/features/cupboards/components/CupboardWidthOverlay.jsx`
   New file for the overlay itself.

3. Optional helper file:
   - `src/features/cupboards/lib/formatWidthLabel.js`
   or
   - extend `src/features/planner/lib/roomFormatting.js` with a focused formatter if the team wants to keep all user-facing millimeter formatting together

The narrower option is a cupboard-local helper because this label is scene-specific rather than planner-panel-specific.

**Geometry rules and edge cases**

- Back wall cabinets:
  - no special handling beyond the shared local-space implementation
- Left and right wall cabinets:
  - still use local `size[0]` as width
  - the parent rotation handles orientation
- Imported or unavailable cabinets:
  - still show width if `width` or `size[0]` is present
  - width visibility must not depend on live catalog availability
- Missing or malformed size data:
  - return `null` from the overlay component instead of crashing the scene
- Very narrow cabinets:
  - if width is too small for the text to sit above the line cleanly, keep the label centered above the cabinet instead of trying to fit it inside the span
- Resize handle overlap:
  - keep the label vertically above the handle tops and slightly farther forward than the handles
- Z-fighting:
  - offset the overlay toward the viewer-side of the cabinet front face
- Pointer interference:
  - do not attach pointer handlers
  - if needed, set `raycast={null}` on purely decorative meshes

**Testing plan**

Add or update tests close to the existing renderer tests.

1. `src/features/cupboards/components/CupboardRenderer.test.js`
   Add coverage for:
   - selected cupboard renders a width overlay
   - placement preview renders a ghost width overlay
   - idle non-selected cupboards do not render overlays
   - invalid active preview passes invalid state into the overlay

2. New test file, for example `src/features/cupboards/components/CupboardWidthOverlay.test.js`
   Add coverage for:
   - label formatting prefers explicit `widthMm`
   - falls back to `size[0]` conversion
   - returns `null` for invalid or missing size input
   - local endpoint coordinates are derived from `size[0]` and `size[2]`

3. Optional test in `SelectedCupboardWidthControls.test.js`
   Confirm the overlay placement constants do not collide conceptually with the resize-control-only rendering contract if a shared wrapper component is introduced.

**Manual verification checklist**

- Select a cabinet in the scene and confirm a readable width label appears directly near that cabinet.
- Start placement preview from the catalog and confirm the preview cabinet shows its width before placement.
- Resize a selected cabinet and confirm the width label updates live to each snapped supported width.
- Move a selected cabinet between supported walls and confirm the width label stays correctly aligned.
- Try an invalid resize or invalid preview and confirm the width overlay switches to invalid styling.
- Place multiple cabinets and confirm only the active one shows the full overlay, preventing scene clutter.
- Click around the overlay area and confirm cabinet selection and resize interactions still work.

**Acceptance criteria**

- Width is visible in the 3D scene for the active cabinet workflow states.
- Width always matches the actual rendered cabinet variant, not an approximate pointer distance.
- The overlay remains correct for cabinets on the back, left, and right walls.
- The overlay does not break pointer-based move, select, or resize interactions.
- The implementation reuses existing cabinet state and does not introduce duplicate width state in the reducer.

**Risk to watch**

The main risk is readability and interaction overlap, not data correctness. Width data already exists. The implementation effort should focus on scene composition, label placement, and ensuring the overlay never blocks current pointer interactions. The safest first release is a selected-or-active-only overlay policy, with support for "show widths for all cabinets" deferred until the scene has a stronger decluttering model.
