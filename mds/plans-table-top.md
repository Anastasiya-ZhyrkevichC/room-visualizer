# Incremental Implementation Plan Table Top

This plan assumes the current prototype already has:

- a planner-style layout with a right-side summary card and a 3D room stage
- placed cupboards stored in `CupboardProvider` with stable `id`, `size`, `position`, `rotation`, and `wall` data
- wall-aware geometry helpers in `src/features/cupboards/model/placement.js` and `src/features/cupboards/model/geometry.js`
- room-scene rendering routed through `src/features/room/components/RoomShell.jsx`

## Current implementation check

- `src/features/planner/components/PlannerSummaryPanel.jsx` still shows only room dimensions, module count, and inspector state. It does not derive or list higher-level scene elements.
- `src/features/room/components/RoomShell.jsx` renders walls, floor, and `CupboardRenderer`, but there is no tabletop mesh layer above the cabinets.
- `src/features/cupboards/model/catalog.js`, `createPlacementPreview`, and `createCupboard` do not store any metadata about whether a cabinet should generate a tabletop or how that top surface should be described.
- `src/features/cupboards/model/placement.js` already contains the most useful primitives for this feature, especially wall-aligned span calculation and same-wall grouping geometry.
- There is no shared selector today that can merge multiple cupboards into one derived object, so the room scene and planner summary would currently have to duplicate tabletop logic.

The 5 steps below focus specifically on straight tabletop runs above eligible cupboards, one shared derived model for both the scene and the planner summary, and the requested grouping rule: separate mentions for disconnected pieces, one merged mention for attached cupboards that form one continuous run.

## Step 1. Define Which Cabinets Can Carry a Table Top

**Goal**

Create one explicit tabletop contract before geometry and UI work start depending on implicit cabinet assumptions.

**What is going to be implemented**

A first-pass tabletop support model that marks eligible cabinet types, defines the top surface that the tabletop sits on, and introduces a few shared tabletop constants.

**Description**

The app currently knows cabinet size and placement, but not whether a placed cabinet should participate in a tabletop run. That decision should not be inferred ad hoc inside the summary panel or a renderer. The cleanest starting point is to add explicit tabletop support metadata to cabinet definitions and carry it onto placed cupboards. For the first pass, one tabletop should mean one continuous straight run on one wall and one top height. That fits the current mesh system well and avoids pretending that an L-shaped corner top is the same object as a straight board.

**Required work**

- Add an explicit tabletop capability field to starter cabinet definitions in `src/features/cupboards/model/catalog.js`, such as `supportsTableTop` or a richer `tableTopProfile`.
- Carry that tabletop metadata through `createPlacementPreview` and `createCupboard` in `src/features/cupboards/model/placement.js`.
- Define shared first-pass constants such as tabletop thickness, optional front overhang, and merge tolerance.
- Add one helper that resolves a cupboard's tabletop support surface from `size`, `position`, `rotation`, and `wall`.
- Make the first-pass scope explicit: base and drawer cabinets should participate by default, while wall and tall cabinets should stay out unless they are deliberately enabled later.
- Keep corner behavior explicit instead of implicit: same-wall straight runs merge in v1, while 90-degree corner pieces remain separate until a dedicated corner tabletop shape exists.

**Manual testing criteria**

- A placed base cabinet exposes tabletop support data.
- A placed drawer cabinet exposes tabletop support data.
- Tall or wall cabinets do not accidentally create tabletop runs.
- Moving or rotating a cabinet does not lose its tabletop eligibility or top-surface geometry.

## Step 2. Derive Merged Table Top Runs From Placed Cupboards

**Goal**

Turn individual supporting cupboards into merged tabletop pieces that the rest of the app can trust.

**What is going to be implemented**

A pure tabletop-run derivation layer that groups eligible cupboards by wall and top plane, then merges touching or near-touching spans into one continuous run.

**Description**

The summary requirement is fundamentally about runs, not individual cabinets. Two disconnected support groups should yield two run records. Two attached cupboards should yield one run record. The project already computes same-wall spans for collision checks, so the implementation should reuse that geometry instead of inventing a second wall-span system. Each derived run should include enough data for both rendering and summary output: wall, span, center, size, supported cupboard ids, and formatted dimensions.

**Required work**

- Create a new shared helper such as `src/features/cupboards/model/tableTop.js` rather than embedding merge logic inside a React component.
- Reuse or extract wall-span helpers from `src/features/cupboards/model/placement.js` so tabletop grouping and collision grouping stay mathematically aligned.
- Filter the cupboard list down to tabletop-supporting cupboards only.
- Group candidates by wall and resolved top-surface height so cupboards at different elevations do not merge into one board accidentally.
- Sort spans along the wall axis and merge neighbours when the gap between them is `0` or within a small tabletop merge tolerance.
- Define one explicit depth rule for merged runs, preferably the maximum supporting depth in the run, so mixed-depth data remains deterministic.
- Return stable run records with fields such as `id`, `wall`, `start`, `end`, `center`, `length`, `depth`, `topY`, and `cupboardIds`.

**Manual testing criteria**

- Two separated cupboard groups on the same wall produce two tabletop runs.
- Two flush neighbouring cupboards on the same wall produce one merged tabletop run.
- Tiny floating-point drift does not split one visually continuous run into two summary records.
- Cupboards on different walls do not merge into one straight tabletop run.
- Cupboards with different top heights do not merge into one tabletop run.

## Step 3. Expose Table Top Runs Through State and Render Them in the Scene

**Goal**

Make tabletop runs a visible planner element instead of a summary-only abstraction.

**What is going to be implemented**

A memoized tabletop selector in the cupboard state layer plus a dedicated tabletop renderer mounted into the room scene.

**Description**

Both the planner summary and the 3D room need the same run data. That means the app should compute tabletop runs once and expose them through the same provider that already serves cupboards, preview, and selection state. With that in place, the room can render one thin board mesh per run above the supporting cupboards. Because active move already mutates cupboard positions live, the tabletop layer will naturally update during drag interactions as long as it reads from the shared derived data.

**Required work**

- Add a selector such as `selectTableTopRuns` in `src/features/cupboards/selectors.js` or a dedicated tabletop selector module.
- Memoize the derived runs inside `src/features/cupboards/state/CupboardProvider.jsx` and expose them alongside `cupboards`, `placementPreview`, and `selectedCupboard`.
- Add a new renderer such as `src/features/cupboards/components/TableTopRenderer.jsx`.
- Mount that renderer from `src/features/room/components/RoomShell.jsx` so table tops render in the same coordinate space as cupboards.
- Render one board mesh per tabletop run with a clear material and thickness that reads as a countertop rather than another cabinet.
- Decide the first-pass preview rule explicitly: either render table tops for placed cupboards only, or also include a ghost tabletop when `placementPreview` is valid.

**Manual testing criteria**

- Adding one eligible cabinet creates one visible tabletop piece above it.
- Adding an attached cabinet extends the existing tabletop run instead of stacking a second overlapping board.
- Two disconnected cabinet groups show two separate tabletop pieces in the room.
- Moving or deleting cupboards updates the tabletop geometry immediately.

## Step 4. Add a Dedicated Table Top Block to Planner Summary

**Goal**

Show the tabletop result in planner summary using the same merge rules as the 3D scene.

**What is going to be implemented**

A tabletop summary block inside `PlannerSummaryPanel` that renders one line item per derived tabletop run.

**Description**

The current summary panel is still a placeholder, so this feature should replace that placeholder with actual derived planner information. The important detail is that the summary must consume tabletop runs, not raw cupboards. That is what guarantees the requested behavior: one mention for one merged run, two mentions for two disconnected runs. Each line item should be readable at a glance, for example by showing the wall and the tabletop dimensions in millimeters.

**Required work**

- Update `src/features/planner/components/PlannerSummaryPanel.jsx` to read `tableTopRuns` from `useCupboards()`.
- Add formatting helpers in `src/features/planner/lib/roomFormatting.js` for tabletop labels and tabletop dimensions.
- Add a dedicated `Table top` or `Table tops` block inside the summary card instead of burying the data in the generic metric list.
- Render one row per tabletop run with stable ordering, such as wall order plus span start position.
- Keep the block readable when there are multiple pieces, including a deliberate empty state when no eligible cupboards exist.
- Update `src/features/planner/styles/summary.css` if needed so the tabletop list reads as a planner feature rather than debug text.

**Manual testing criteria**

- One merged tabletop run appears as one summary mention.
- Two disconnected tabletop runs appear as two separate summary mentions.
- Moving a cupboard so one run splits into two updates the summary immediately.
- Moving two runs together so they become attached merges them into one summary mention.
- An empty room shows a clean tabletop empty state instead of an empty or broken block.

## Step 5. Add Regression Coverage for Merge, Split, and Summary Sync

**Goal**

Keep tabletop grouping reliable as placement, movement, and summary features keep evolving.

**What is going to be implemented**

Automated coverage for tabletop eligibility, run merging, scene rendering, and planner-summary output.

**Description**

This feature depends on geometry tolerances and derived grouping, which makes it easy to regress accidentally. The merge logic should therefore be covered at the model level first. After that, the UI only needs enough tests to prove that one derived run becomes one rendered board and one summary mention. The main risk to guard against is duplicated logic drifting between the model, the room scene, and the summary panel.

**Required work**

- Add unit tests for the new tabletop model that cover eligible-cabinet filtering, same-wall merge, disconnected split, top-height split, and deterministic depth selection.
- Add selector or provider-level tests if tabletop derivation is memoized or combined with preview state.
- Add a lightweight renderer test that proves one tabletop run produces one rendered tabletop mesh.
- Add a summary or formatting test that proves one tabletop run produces one summary mention and two runs produce two mentions.
- Add regression coverage around add, move, rotate, and delete flows so tabletop runs stay in sync with cupboard state changes.
- Document the first-pass limitation around corner or L-shaped table tops so later work can extend it intentionally instead of changing merge rules by accident.

**Manual testing criteria**

- Automated tests fail if connected cupboards start producing multiple tabletop mentions again.
- Automated tests fail if disconnected cupboards collapse into one tabletop mention.
- The scene and the summary stay in sync after repeated add, move, rotate, and delete actions.
- Tabletop rendering and summary output remain stable after future placement-model changes.
