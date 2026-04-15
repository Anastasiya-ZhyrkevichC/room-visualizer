# Refactoring Review

## Summary

- All non-test files under `src/` are reachable from `src/index.js`. There is no obviously dead runtime feature file inside the live app path.
- The main cleanup opportunities are scaffold leftovers, archived prototypes, unused exports inside live files, and a few modules that are doing too much.

## Confirmed Unused Or Low-Value Parts

1. `src/reportWebVitals.js` and the `reportWebVitals()` call in `src/index.js`
   - The function is called without a callback, so it has no runtime effect.
   - If you are not planning to wire performance reporting, remove the file and the `web-vitals` dependency.

2. `package.json`: `cra-template`
   - This is a Create React App scaffold dependency.
   - It is not needed after the project has been created.

3. `package.json`: direct `@mediapipe/tasks-vision`
   - No app code imports it.
   - `@react-three/drei` already brings its own copy transitively, so the direct dependency looks redundant.
   - Removing the direct dependency will simplify the tree, but it will not remove the source-map warning by itself because that warning comes from the transitive copy inside `@react-three/drei`.

4. `public/logo512.png`
   - No references were found.
   - `logo192.png` is still referenced by `public/index.html`.

5. Archived prototypes outside the app path
   - `prototypes/RayCasterExample.jsx`
   - `prototypes/mouse-move-raycaster-example/*`
   - These are not part of the production import graph. Keep them only if they still help as historical reference.

6. Older placement helpers in `src/features/cupboards/model/placement.js`
   - `CABINET_GAP`
   - `createInitialCupboardPosition`
   - `getFloorAlignedPreviewPosition`
   - `getAttachedCupboardPosition`
   - `alignCupboardToBackWall`
   - These are referenced by tests and planning notes, but not by the current live placement or move flow.

## Easy Simplifications

1. Reduce exported surface area
   - `src/features/room/lib/wallRaycast.js`: `getWallTargetById` is exported but only used inside the same file.
   - `src/features/cupboards/model/renderModel.js`: `getDefaultCabinetModel` is exported but only used inside the same file.
   - `src/config/plannerConfig.js`: `plannerConfig` is exported, but runtime code only uses `resolveCabinetRenderMode()`.

2. Remove unused `forwardRef` wrappers if refs are not planned
   - `src/features/room/components/RoomBox.jsx`
   - `src/features/room/components/FloorPlane.jsx`
   - `src/features/room/components/WallPlane.jsx`
   - Current live call sites do not pass refs to these components.

3. Trim stale project scaffolding
   - `public/index.html` still says `React App` and `Web site created using create-react-app`.
   - `public/manifest.json` still contains Create React App sample metadata.
   - `README.md` still reads like a changelog notebook instead of project documentation.

## Refactoring Ideas For Easier-To-Read Code

1. Split `src/features/cupboards/components/KitchenCabinetModel.jsx`
   - It is about 405 lines and mixes theme selection, geometry math, and mesh assembly.
   - A cleaner split would be:
     - `cabinetTheme.js`
     - `cabinetMetrics.js`
     - `cabinetParts.js`
     - `KitchenCabinetModel.jsx`

2. Break `src/features/cupboards/state/cupboardReducer.js` into smaller reducers or action handlers
   - It handles selection, placement preview, movement, rotation, and deletion in one switch.
   - Splitting placement logic from move logic would make behavior easier to scan and test.

3. Extract shared pointer-session logic
   - `src/features/planner/components/CabinetCatalogPanel.jsx`
   - `src/features/room/components/PlacementPreviewController.jsx`
   - `src/features/room/components/CupboardMoveController.jsx`
   - These files all manage similar window-level pointer and keyboard lifecycles. A small hook would reduce repetition and make cleanup rules easier to trust.

4. Separate runtime API from test-only helpers
   - `placement.js` and `renderModel.js` currently expose more than the runtime uses.
   - Keeping public exports limited to real runtime entry points will make the model layer easier to understand.

5. Decide whether empty catalog groups are intentional
   - `starterCabinetUsageGroups` includes `wall` and `corner`, but there are no starter cabinets in those groups yet.
   - If they are roadmap placeholders, label them clearly.
   - If not, derive groups from the actual catalog and hide empty sections.

6. Move the project off Create React App when convenient
   - `npm test` and `npm run build` both work, but the toolchain emits warnings tied to old CRA/Babel internals.
   - `npm test -- --detectOpenHandles` points at the CRA Babel stack, not your app code.
   - A Vite migration is the cleanest medium-term refactor if you want less toolchain noise and easier maintenance.

7. Make the styling entry point more local to the feature
   - `src/App.css` is currently just an import hub for feature CSS.
   - Moving that responsibility to a planner-level stylesheet would make the app root thinner and keep style ownership closer to the feature.

## Verification Notes

- `npm test -- --watchAll=false`: passed, 7 suites / 37 tests.
- `npm run build`: succeeded.
- Current warnings come from toolchain age and dependency packaging, not from obvious dead runtime source files:
  - stale `browserslist` data
  - CRA / Babel preset deprecation warning
  - source-map warning for transitive `@mediapipe/tasks-vision`
