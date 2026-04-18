# Incremental Implementation Plan Split Placement Model

This plan assumes the current prototype already has:

- wall identifiers isolated in `src/features/cupboards/model/walls.js`
- cupboard footprint and rotation helpers in `src/features/cupboards/model/geometry.js`
- reducer-driven placement, move, resize, and rotate flows in `src/features/cupboards/state/cupboardReducer.js`
- regression coverage for placement behavior in `src/features/cupboards/model/placement.test.js` and `src/features/cupboards/state/cupboardReducer.test.js`

## Current implementation check

- `src/features/cupboards/model/placement.js` is currently a large catch-all module that mixes constants, wall alignment, placement preview creation, collision validation, magnetic snap rules, resize anchoring, width stepping, and a few older helpers.
- `src/features/cupboards/state/cupboardReducer.js` imports placement-preview helpers, move validation, resize outcomes, and wall-alignment helpers from that same file, so most cupboard interaction changes naturally converge on one module.
- UI-facing files such as `src/features/planner/lib/stageMessaging.js`, `src/features/room/lib/wallRaycast.js`, and `src/features/cupboards/components/SelectedCupboardWidthControls.jsx` also depend on values exported from `placement.js`, which broadens the file's surface area even more.
- `src/features/cupboards/model/walls.js` already shows that part of this model layer can live in narrower files without harming the public API.
- The current test coverage is strong enough to support a structural refactor as long as runtime behavior is kept unchanged.

The single step below focuses specifically on removing `placement.js` as the architectural choke point by splitting it into focused modules while preserving the current planner behavior.

## Step 1. Split Placement Responsibilities Behind a Stable Public API

**Goal**

Turn `placement.js` from a catch-all interaction file into a thin public entry point backed by smaller focused modules, so placement, move, resize, and messaging work can evolve with less merge pressure.

**What is going to be implemented**

One behavior-preserving refactor that separates placement constants, wall alignment, validation, and resize logic into dedicated model files while keeping the reducer and UI on a stable import surface during the transition.

**Description**

The main problem is not that placement logic is shared. Shared rules are correct here. The problem is that too many different kinds of rules currently live in one physical file, so unrelated features still collide in source control. A cabinet pricing tweak may need a constant, magnetic placement work may need validation changes, resize work may need anchored span logic, and stage messaging may need a reason label, yet all of those changes encourage edits to the same module.

The fix should preserve the current domain model but narrow the ownership boundaries. Wall alignment math should live with wall-aligned positioning. Collision and magnetic behavior should live with placement validation. Resize-specific edge anchoring and width-variant resolution should live in a resize-focused module. Shared enums and reason codes should move to a small constants file. After that split, `placement.js` can either become a thin barrel or disappear entirely once imports have been updated. The important outcome is that future work on one interaction concern should not require opening the file that owns all the others.

The intended target split for the current file is:

- `src/features/cupboards/model/placementConstants.js`
  - `CUPBOARD_RESIZE_SIDES`
  - `SAME_WALL_MAGNETIC_TOLERANCE`
  - `PLACEMENT_VALIDATION_REASONS`
  - `MAGNETIC_ATTACHMENT_EDGES`
- `src/features/cupboards/model/wallAlignment.js`
  - `isPlacementWall`
  - `getWallAlignedRotation`
  - `getBackWallAlignedPreviewPosition`
  - `getLeftWallAlignedPreviewPosition`
  - `getRightWallAlignedPreviewPosition`
  - `getWallAlignedPreviewPosition`
  - `alignCupboardToWall`
  - `alignCupboardToBackWall`
- `src/features/cupboards/model/placementFactories.js`
  - `createCupboard`
  - `createPlacementPreview`
  - `createPlacementValidationResult`
  - `createInitialCupboardPosition`
- `src/features/cupboards/model/placementValidation.js`
  - same-wall span helpers
  - blocked-interval and magnetic snap logic
  - corner-collision checks
  - `validatePlacementCandidate`
  - `getPlacementValidationReasonLabel`
- `src/features/cupboards/model/cupboardResize.js`
  - resizable-width variant resolution
  - anchored-edge resize helpers
  - `getCupboardResizeDragOutcome`
  - `getCupboardWidthStepOutcome`
- `src/features/cupboards/model/placement.js`
  - temporary thin re-export layer during the migration, then removable once consumers import from the new modules directly

**Required work**

- Create the new model files listed above and move the existing logic out of `src/features/cupboards/model/placement.js` without changing behavior.
- Keep wall ids in `src/features/cupboards/model/walls.js` and import them into the new modules rather than moving them back into the placement split.
- Move non-exported helper functions into the narrowest owning file instead of recreating one new catch-all helper module.
- Keep a stable public API during the refactor by either:
  - leaving `src/features/cupboards/model/placement.js` as a thin re-export layer, or
  - updating all imports in one pass if that produces a cleaner result with low risk
- Update `src/features/cupboards/state/cupboardReducer.js` to import:
  - preview and creation helpers from `placementFactories.js`
  - validation from `placementValidation.js`
  - resize outcomes from `cupboardResize.js`
  - wall alignment from `wallAlignment.js`
- Update small UI/helper consumers to import from the narrowed modules:
  - `src/features/planner/lib/stageMessaging.js`
  - `src/features/room/lib/wallRaycast.js`
  - `src/features/cupboards/state/CupboardProvider.jsx`
  - `src/features/cupboards/components/SelectedCupboardWidthControls.jsx`
- Separate runtime-facing exports from older or test-only helpers so the public surface reflects the actual live interaction flows.
- Update `src/features/cupboards/model/placement.test.js` to either:
  - keep testing through `placement.js` while it remains a barrel, or
  - split tests by module ownership into `placementValidation.test.js` and `cupboardResize.test.js` if the barrel is removed
- Preserve the current reducer tests in `src/features/cupboards/state/cupboardReducer.test.js` as the behavior safety net while the model files are being rearranged.

**Manual testing criteria**

- Starting placement preview still creates a valid ghost flow for supported walls and keeps the same default orientation and positioning behavior.
- Moving an existing cupboard still uses the same wall-aware snapping, collision checks, and invalid-drop behavior as before the refactor.
- Resizing a cupboard still keeps the correct anchored edge behavior and continues to respect bounds and neighboring cupboards.
- Rotating a selected cupboard still realigns the cupboard to its wall correctly.
- A small change to stage messaging, wall constants, or resize logic can be made in separate files without editing the core placement-validation module.
