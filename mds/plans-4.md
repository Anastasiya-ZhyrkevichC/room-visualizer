# Incremental Implementation Plan 4

This plan assumes the current prototype already has:

- a planner-style layout with a cabinet catalog and 3D room shell
- wall-aware cabinet placement for supported walls
- click selection for placed cabinets
- stable cabinet data for size, wall attachment, position, and orientation

The 5 steps below focus specifically on cabinet movement with bounds and collision validation. They split movement safety into smaller pieces so the behavior can be introduced without turning drag interaction into a hard-to-debug bundle of rules.

## Step 1. Add a Dedicated Move Mode for Placed Cabinets

**Goal**

Let the user reposition an already placed cabinet along its current wall with a stable, explicit interaction.

**What is going to be implemented**

A drag-to-move flow for selected cabinets that enters a dedicated move mode, shows live movement, and keeps the cabinet attached to its wall.

**Description**

Before validation rules become useful, cabinet movement itself needs to be predictable. This step is only about moving an existing cabinet in a controlled way. The cabinet should follow the pointer along one allowed axis, keep its wall alignment, and preserve its original position until the move is committed.

**Required work**

- Allow the user to start moving a selected cabinet directly from the 3D scene.
- Enter a dedicated move mode for the active cabinet.
- Keep movement constrained to the cabinet's current wall and allowed axis.
- Update the cabinet position continuously while dragging.
- Preserve wall alignment and cabinet orientation during movement.
- Keep track of the cabinet's original position so the move can be canceled or reverted cleanly.

**Manual testing criteria**

- A placed cabinet can be selected and dragged without creating a new cabinet.
- The cabinet moves in real time while the pointer moves.
- The cabinet stays attached to the same wall during movement.
- Releasing the pointer in a clearly valid position keeps the cabinet there.
- Canceling the move restores the original position.

## Step 2. Block Movement That Pushes a Cabinet Outside the Room Bounds

**Goal**

Make it impossible to move a cabinet so that any part of its box leaves the valid room volume.

**What is going to be implemented**

Room-bounds validation for cabinet movement, based on the cabinet's actual occupied footprint rather than only its center point.

**Description**

This step covers the first core requirement: no box should end up colliding with the room bounds. The validation should be based on the cabinet's real size and orientation on its wall. A move is only valid if the entire cabinet body remains inside the room.

**Required work**

- Calculate the cabinet's occupied footprint on its wall using its current size and orientation.
- Derive the valid movement range from the room dimensions and wall attachment.
- Prevent the cabinet from being committed if any part of its box would cross the room boundary.
- Keep the last valid position available while the move is in progress.
- Show a blocked or invalid state when the requested position is out of bounds.
- Make sure bounds rules still work after cabinet rotation if rotation changes the footprint.

**Manual testing criteria**

- Moving a cabinet toward the left, right, or corner edge of its wall stops before the cabinet leaves the room.
- The cabinet cannot be released in a position where part of it sticks outside the room.
- Moving back into a valid area restores a normal valid state.
- A rotated cabinet still respects the correct room bounds.
- Invalid releases do not leave the cabinet half outside the room.

## Step 3. Block Overlap With Neighbouring Cabinets on the Same Wall

**Goal**

Make it impossible to move one cabinet into another cabinet on the same wall.

**What is going to be implemented**

Same-wall collision validation using the occupied span of the moving cabinet and the occupied spans of neighbouring cabinets.

**Description**

Bounds validation alone is not enough. Users also need to be blocked from placing one cabinet inside another. For cabinets attached to the same wall, the simplest reliable approach is to compare occupied intervals along the wall and reject overlaps while still allowing edge-to-edge placement.

**Required work**

- Detect the occupied span of every placed cabinet on a wall.
- Compare the moving cabinet's candidate span against all other cabinets on the same wall.
- Treat true overlap as invalid and edge-touching as valid.
- Exclude the cabinet currently being moved from collision comparisons.
- Prevent collision states from being committed on pointer release.
- Keep the move interaction smooth while collision checks run continuously.

**Manual testing criteria**

- Moving a cabinet into a neighbouring cabinet on the same wall is blocked.
- Releasing the pointer while cabinets overlap does not commit the move.
- Moving a cabinet so its edge touches another cabinet is allowed if no overlap exists.
- Moving away from the collision area restores a valid state immediately.
- Other cabinets remain stable and do not shift unexpectedly during the check.

## Step 4. Validate Corner Cases Across Adjacent Walls

**Goal**

Prevent cabinet intersections near room corners when cabinets are attached to different walls.

**What is going to be implemented**

Cross-wall collision checks for cabinets whose full box footprints can intersect near shared corners.

**Description**

Same-wall collision checks do not cover all real layout problems. A cabinet on the back wall can still intersect a cabinet on a side wall near the corner even when each cabinet looks valid on its own wall. This step adds the extra validation needed to keep multi-wall layouts believable.

**Required work**

- Compare the moving cabinet's full box footprint against cabinets on adjacent supported walls.
- Detect intersections near shared room corners, not just overlaps on the same wall axis.
- Block moves that would cause cabinets on different walls to cut through each other.
- Preserve valid corner layouts where cabinets only touch at intended edges.
- Re-run cross-wall validation after rotation when the cabinet footprint changes.
- Keep the rules explicit so future corner-unit exceptions can be added separately if needed.

**Manual testing criteria**

- A cabinet on the back wall cannot be moved into the volume occupied by a cabinet on a side wall.
- A cabinet on a side wall cannot be moved through a cabinet near the back-wall corner.
- Valid non-overlapping corner layouts still work.
- Rotating a cabinet near a corner updates the collision result correctly.
- Invalid corner moves are rejected without breaking scene state.

## Step 5. Add Clear Validation Feedback and Commit Rules

**Goal**

Make movement validation understandable to the user before the move is committed.

**What is going to be implemented**

Explicit valid and invalid move feedback, reason messages, and reliable snap-back behavior when a move ends in a blocked state.

**Description**

Once bounds and collision rules exist, the user needs clear feedback about why a move is blocked. This step makes the feature usable rather than merely correct. A cabinet should either end in a valid position or return to its last valid position, with no ambiguous in-between state.

**Required work**

- Show a clear valid state while the cabinet is in an allowed position.
- Show a clear invalid state while the cabinet is out of bounds or colliding.
- Provide a short readable reason for blocked movement, such as bounds or cabinet overlap.
- Prevent invalid positions from being committed when the pointer is released.
- Snap the cabinet back to its last valid position after an invalid release.
- Keep the cabinet selected after a blocked move so the user can immediately try again.

**Manual testing criteria**

- During movement, the user can tell whether the current position is valid before releasing the pointer.
- Out-of-bounds and cabinet-collision states are both visible and understandable.
- Releasing the pointer on an invalid position returns the cabinet to the last valid position.
- Releasing the pointer on a valid position commits the move normally.
- After a blocked move, the cabinet remains selected and the app is ready for another attempt.
