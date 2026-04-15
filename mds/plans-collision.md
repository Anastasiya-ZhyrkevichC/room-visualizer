# Incremental Implementation Plan Collision

This plan assumes the current prototype already has:

- a planner-style layout with a cabinet catalog, 3D room shell, and selection flow
- wall-aware placement on the back, left, and right walls
- live placement preview plus drag-to-move for already placed cabinets
- cabinet meshes that already support distinct visual states for ghost, moving, and selected objects

## Current implementation check

- Overlap prevention is not implemented in the active placement flow yet. The current reducer marks a preview as valid when it is on a supported wall and inside the clamped wall span, but it does not compare the candidate cabinet against other placed cabinets.
- Invalid placement is not rendered red today. The current ghost and moving states use amber-toned preview styling, not an explicit invalid material.
- The "no gaps between cabinets" rule is also not implemented in the live flow. A `CABINET_GAP` constant exists in the placement model, but it is only used by an older attach-position helper and is not enforced by the current preview or move reducers.

The 5 steps below focus specifically on collision-safe placement, zero-gap adjacency, and invalid-state feedback. They also keep placement and movement aligned so the app does not allow a layout rule in one flow and break it in the other.

## Step 1. Build a Shared Placement Validation Model

**Goal**

Move all placement and movement rules into one explicit validation layer instead of scattering them across pointer handlers and reducer branches.

**What is going to be implemented**

A shared placement validator that receives a candidate cabinet state and returns a structured result such as `isValid`, `reason`, `snappedPosition`, and collision details.

**Description**

The current flow mostly answers one question: "is the pointer on a supported wall?" That is not enough for overlap blocking, zero-gap snapping, or red invalid feedback. Before adding new rules, the planner needs one shared validator that both placement preview and move mode can call continuously. That validator should keep the candidate position available even when the result is invalid, so the preview can still render where the user is trying to place the cabinet.

**Required work**

- Create a shared validation helper for candidate cabinet placement and movement.
- Return explicit validation metadata such as validity, failure reason, wall, snapped position, and colliding cabinet ids.
- Keep room-bounds alignment and wall alignment inside the shared validator rather than duplicating it in separate reducer paths.
- Update placement preview state to store validation result details, not only a boolean `isValid`.
- Update active move state to use the same validation result shape.
- Keep the candidate position visible even when the candidate is invalid because of overlap or adjacency failure.

**Manual testing criteria**

- Placement preview and move mode both use the same validity rules.
- The app can distinguish between invalid wall targeting, overlap, and adjacency failures.
- The preview remains visible while invalid instead of disappearing immediately.
- Valid candidates still snap correctly to the chosen wall.

## Step 2. Block Same-Wall Overlap While Allowing Edge Contact

**Goal**

Prevent cabinets on the same wall from overlapping while still allowing them to touch edge to edge.

**What is going to be implemented**

Same-wall span collision detection for both placement preview and moving placed cabinets.

**Description**

This is the core bug the user reported. For supported wall placement, the simplest reliable rule is to compare occupied spans along the wall axis. If two spans overlap, the candidate is invalid. If their edges only touch, the candidate remains valid. This step should apply during preview and during movement so the project has one consistent collision rule.

**Required work**

- Derive the occupied span of a cabinet on each supported wall from its size, wall, rotation, and snapped position.
- Compare a candidate span against all other cabinets attached to the same wall.
- Exclude the cabinet currently being moved from self-collision checks.
- Treat true overlap as invalid and exact edge contact as valid.
- Feed overlap failures back through the shared validation result with a readable reason.
- Prevent `FINISH_PLACEMENT_PREVIEW` and `FINISH_CUPBOARD_MOVE` from committing overlap states.

**Manual testing criteria**

- A new cabinet cannot be placed on top of another cabinet on the same wall.
- A moved cabinet cannot be released while overlapping another cabinet on the same wall.
- Two cabinets can still sit flush against each other with no overlap.
- Leaving the overlap area restores a valid state immediately.


## Step 4. Show Invalid Cabinets in Red and Block Invalid Commit

**Goal**

Make invalid placement obvious before the user releases the pointer, and never commit an invalid result.

**What is going to be implemented**

An explicit invalid render state for preview and active movement, plus reducer commit rules that refuse invalid placement.

**Description**

Validation only helps if the user can see it. The planner should render the candidate cabinet in red when the current position is invalid because of overlap, gap, or unsupported placement. The user should be able to drag back into a valid position and see the red state clear immediately. On release, invalid placement should not be committed.

**Required work**

- Add an explicit invalid visual state to cupboard rendering components.
- Render ghost cabinets in red when placement preview is invalid.
- Render the actively moved cabinet in red when the move candidate is invalid.
- Update outline colors and material props so invalid state is visually stronger than selected or moving state.
- Show a short stage hint or reason label for invalid states such as `Overlaps another cabinet` or `Leave no gap between cabinets`.
- Keep invalid placement from being committed on pointer release.
- Decide whether an invalid release keeps the preview active or restores the last valid position, and make that behavior explicit.

**Manual testing criteria**

- The placement preview turns red when it overlaps another cabinet.
- The placement preview turns red when it leaves a forbidden gap.
- Releasing the pointer while the cabinet is red does not place the cabinet.
- Returning to a valid position restores the normal preview styling immediately.
- Invalid move feedback is visually distinct from normal selected or moving state.

## Step 5. Cover Corner Collisions and Add Regression Tests

**Goal**

Finish the feature so it remains reliable once cabinets are placed on multiple walls.

**What is going to be implemented**

Cross-wall corner collision checks plus automated regression coverage for placement, movement, adjacency, and invalid rendering state.

**Description**

Same-wall overlap is the first problem, but it is not the only believable collision case. A cabinet on the back wall can still intersect a cabinet on a side wall near a shared corner. This final step closes those corner cases and adds test coverage so later changes to placement logic do not silently reintroduce overlap or gap bugs.

**Required work**

- Compare full candidate footprints against cabinets on adjacent walls near shared corners.
- Treat cross-wall box intersections as invalid while still allowing intended edge contact.
- Reuse the same invalid feedback path for corner collisions.
- Add reducer and model tests for same-wall overlap rejection.
- Add reducer and model tests for zero-gap adjacency snapping and gap rejection.
- Add reducer and model tests for invalid placement commit blocking.
- Add rendering or component-level tests for the red invalid state if the current test setup supports them.

**Manual testing criteria**

- A back-wall cabinet cannot be placed through a side-wall cabinet near a corner.
- A side-wall cabinet cannot be moved into the volume of a back-wall cabinet near the same corner.
- Cross-wall invalid states also render red before release.
- Existing valid layouts that only touch at intended edges still work.
- Automated tests fail if overlap blocking, zero-gap enforcement, or invalid commit rules regress later.
