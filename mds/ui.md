# UI Review and Interpretation

This document reviews only the architecture in `mds/architecture-plan.md`. It does not assess the current implementation.

The goal here is to translate that architecture into a clear picture of the UI the customer will actually experience, and to point out where the plan is still too vague to lock the UI down.

## Reading guide

- `Explicit` means the behavior is directly stated in the architecture plan.
- `Inferred` means the behavior is not written literally, but is the most likely UI consequence of the plan.
- `Gap` means the plan is not detailed enough to define the UI confidently.

## 1. Overall UI shape

### Core understanding

The architecture strongly implies a single-page planning workspace, not a wizard and not a dashboard.

The experience is closer to a practical design tool than a marketing website:

- a file/status bar at the top
- a room and catalog control area on the left
- a large interactive 3D room in the middle
- a selection inspector and price summary on the right
- dialogs and toasts layered on top when needed

This is the correct general direction for the product intent in `mds/main_idea.md`: the customer should be able to build a kitchen themselves, see the result immediately, and understand the price without talking to a sales manager.

### Visual personality implied by the architecture

The plan does not define branding, typography, or color palette, but it does imply a specific product tone:

- tool-like rather than decorative
- transparent rather than sales-driven
- confidence-building around pricing and local data ownership
- low-friction rather than enterprise-heavy

The UI should feel like a workbench:

- direct controls
- immediate visual feedback
- visible pricing
- explicit save/export language

It should not feel like:

- a multi-step checkout funnel
- an account-based SaaS app
- a hidden-state "trust us" pricing form

## 2. What the desktop UI most likely looks like

### High-level layout

```text
+--------------------------------------------------------------------------------------------------+
| New | Import | Export | Project: My Kitchen | Autosaved in this browser | Changes since export  |
+--------------------------------------------------------------------------------------------------+
| Room Setup                    | Room Canvas / 3D Planner                      | Selection          |
| - length                      |                                               | - selected module  |
| - width                       |    [camera controls / toolbar overlay]        | - size/material    |
| - height                      |                                               | - rotation         |
| - basic settings              |    interactive room with placed modules        | - duplicate/delete |
|------------------------------|                                               |--------------------|
| Catalog                       |                                               | Price Summary      |
| - search                      |                                               | - subtotal         |
| - category filter             |                                               | - line items       |
| - module cards                |                                               | - explanation      |
| - add module                  |                                               | - optional quote   |
+--------------------------------------------------------------------------------------------------+
| Toasts in a corner. Dialogs appear centered above everything when import/restore/replace is risky. |
+--------------------------------------------------------------------------------------------------+
```

This layout is not written verbatim in the architecture plan, but it is the cleanest interpretation of the named components in section 3.

### Why this layout fits the plan

- `PlannerPage` is described as the container for setup, catalog, canvas, inspector, and file actions.
- `ProjectFileBar` belongs at the top because it is global to the whole workspace.
- `RoomCanvas` is the central interaction surface and should get the most space.
- `RoomSetupPanel` and `CatalogPanel` both act as left-side inputs into the scene.
- `SelectionPanel` naturally belongs on the opposite side because it edits the current object.
- `PriceSummary` should stay visible during editing because price transparency is a core product promise.

## 3. What each area feels like to the user

## 3.1 Project file bar

### Visual understanding

This bar is not just a row of buttons. It is the user's explanation of how persistence works.

The architecture says there is:

- browser-local autosave
- JSON import
- JSON export
- no true `Save`
- no file handles
- no server-side project library

That means the top bar needs to communicate state very carefully. The user should never think the app is saving back into the same local file automatically.

### What the user should see

- `New`
- `Import`
- `Export`
- current project name
- a local status indicator
- last export information or an "unexported changes" signal

### Good copy direction

Because the architecture rejects traditional save semantics, the wording should be explicit:

- `Autosaved in this browser`
- `Changes since last export`
- `Last export: 14:20`
- `Imported from file`

### What should be avoided

- `Saved`
- `All changes saved`
- `Open`
- `Save`
- `Save As`

Those terms would visually promise a file workflow the architecture explicitly does not support.

### Technical details

This bar is fed by `PlannerStore` metadata plus persistence services:

- current `projectName`
- local draft presence/state from `DraftCacheService`
- last export metadata from `ProjectFileService` / `ProjectSerializer`
- dirty status from `PlannerStore`

### Gap

The plan says `dirty/saved status`, `draft/export status`, and `changes since export`, but it does not define a precise UI state model. Before design is finalized, the plan should define the exact statuses the bar can show.

## 3.2 Room setup panel

### Visual understanding

This is likely a compact form card or stacked panel for room dimensions and a small number of room-level settings.

The plan explicitly names:

- room dimensions
- basic room settings

The persisted room schema only shows:

- `lengthMm`
- `widthMm`
- `heightMm`

So the safest UI interpretation is a simple rectangular-room setup form in v1.

### What the user likely sees

- numeric inputs for length, width, and height
- unit labels
- inline validation
- maybe a reset/default action

### Technical details

- writes to `PlannerStore`
- validated by `ValidationService`
- updates the scene in `RoomCanvas`
- triggers pricing recalculation only if room rules affect allowed module placement
- triggers autosave through `DraftCacheService`

### Gap

The architecture never defines what "basic room settings" actually are. If windows, doors, corners, wall segments, or obstacles are out of scope, the plan should say so explicitly, because that changes the panel dramatically.

## 3.3 Catalog panel

### Visual understanding

This is the shopping and discovery side of the tool. It should feel like a searchable parts library rather than a generic e-commerce catalog.

The plan explicitly says:

- local catalog
- search
- category filtering
- add-module action

### What the user likely sees

- a search input at the top
- category tabs, pills, or a dropdown
- a scrollable list of module cards
- each card showing at least:
  - module name
  - category
  - size options summary
  - material availability summary
  - base or starting price indication
  - add action

### Interaction understanding

Selecting a module from this panel likely transitions the planner into placement mode, even though the architecture does not spell that out line by line. That is the most natural bridge between `CatalogPanel`, `PlannerStore`, `PlacementEngine`, and `RoomCanvas`.

### Technical details

- reads catalog data via `CatalogService`
- likely keeps search text and selected category as local UI state
- dispatches `ADD_MODULE` or equivalent into `PlannerStore`
- placement validity then depends on `PlacementEngine`

### Gap

The plan does not define enough of the catalog schema to know how rich the cards can be. Pricing by size and material is central to the product, but the catalog contract is still too vague to define exactly what the card shows before placement.

## 3.4 Room canvas

### Visual understanding

This is the centerpiece of the entire product. It should dominate the page visually and behaviorally.

The architecture explicitly assigns it these jobs:

- display the room
- display placed modules
- support select, place, move, and rotate
- show collision and invalid-placement feedback

That implies a 3D workspace with active editing states, not just a passive preview.

### What the user likely experiences

- the room shell is visible immediately
- placed modules appear as solid objects inside the room
- selecting an object highlights it
- placing or moving an object shows a preview/ghost state
- valid positions snap into place
- invalid positions show warning feedback
- rotation is available either on-canvas, in the inspector, or both

### Important visual states

- empty room state
- placement preview
- selected module highlight
- collision/invalid placement state
- helper overlays such as grid, axes, or wall guides
- camera reset / zoom feedback

### Strong inference on interaction

Even though the plan's add flow says "pick module" then "placement engine validates and snaps", the UI almost certainly needs a visible intermediate placement state. Otherwise the user loses control over where the module initially appears.

A likely v1 interaction is:

1. click module in catalog
2. module enters placement mode
3. canvas shows snapped preview
4. user confirms position
5. module becomes selected for editing

### Technical details

- reads room and module state from `PlannerStore`
- sends move, rotate, select, and place actions back to `PlannerStore`
- uses `PlacementEngine` for snap, bounds, and collision checks
- uses active tool mode from store to determine whether the canvas is in select mode, place mode, or edit mode
- helper toggles come from `Toolbar`

### Gap

The plan does not define:

- the coordinate origin
- object anchor points
- allowed rotation increments
- exact snap rules
- whether placement is click-to-place or drag-to-place

Those are technical details, but they become visible UI behavior immediately.

## 3.5 Selection panel

### Visual understanding

This panel is the object's inspector. It should stay dormant when nothing is selected and become detailed when a module is selected.

### What the user likely sees with no selection

- an empty state such as "Select a module to edit it"
- maybe a short hint that modules are added from the catalog

### What the user likely sees with a selection

- module name
- current dimensions or chosen size
- current material
- rotation control
- position summary, if exposed
- `Duplicate`
- `Delete`

### Relationship to the canvas

The canvas handles direct manipulation, while the selection panel handles precise edits and destructive actions. This is a common and appropriate split for configurators.

### Technical details

- bound to `selectedModule` in `PlannerStore`
- validated by `ValidationService`
- duplicate/delete dispatch actions through the reducer
- any property change triggers pricing recalculation and autosave

### Gap

The plan never defines the exact editable module properties for v1. That means the selection panel's content is still structurally unresolved.

If size, material, hinge direction, or orientation are supported, the plan should enumerate them explicitly.

## 3.6 Toolbar

### Visual understanding

This is most likely a compact overlay attached to the canvas, not a separate heavy panel.

The plan explicitly mentions:

- zoom
- reset view
- toggle helpers

### What the user likely sees

- zoom in / zoom out
- reset camera
- helper toggle for grid, guides, or axes

### Technical details

- mostly pure UI controls
- writes scene-related UI state into `PlannerStore` or canvas-local state
- should not own business data

### Design implication

The toolbar should feel secondary. It supports navigation, but it should not visually compete with pricing, catalog actions, or the inspector.

## 3.7 Price summary

### Visual understanding

This panel is strategically important. The whole business proposition is that the customer sees price clearly while they build.

The architecture explicitly says it should:

- show the current total
- explain how the price is composed

That means the price panel should not be a small footer number. It should be a visible, always-available summary card.

### What the user likely sees

- total price
- module subtotal or line items
- material-related cost effects
- maybe counts by category
- maybe "price updated" feedback after edits

### Technical details

- reads derived totals from `PricingEngine`
- should not compute business rules in the component
- updates after any room or module change that affects pricing

### Gap

The architecture plan does not commit to one of the product's strongest ideas from `mds/main_idea.md`: helping the user understand what changes make the project cheaper or more expensive.

Current architecture supports price transparency.

It does not yet define recommendation UI such as:

- cheaper alternative suggestions
- "material change would add X"
- "smaller module would save Y"

If that guidance is in scope, a dedicated UI section or recommendation component should be added to the plan.

## 3.8 Dialogs and toasts

### Visual understanding

The plan already makes a good distinction:

- dialogs for risky decisions
- toasts for lightweight feedback

That is the correct interaction model.

### Dialog cases explicitly implied by the plan

- restore local draft on app boot
- discard local draft
- confirm import that replaces current working state
- show import validation errors

### Toast cases implied by the plan

- export successful
- import successful
- autosave warning
- validation warning after an edit

### Technical details

- dialogs are driven by important state transitions from `ProjectFileService`, `DraftCacheService`, and validation/import flows
- toasts are event-driven UI feedback, not long-term state

### Gap

The plan does not define autosave failure behavior, quota/full-storage behavior, or multi-tab conflict behavior. If those states matter, the toast and dialog system needs explicit designs for them.

## 4. The user journey through this UI

## 4.1 First visit with no draft

The user lands directly inside the planner workspace, not in an account flow.

Likely experience:

1. they see an empty default room
2. they can set room dimensions
3. they browse modules in the catalog
4. they place modules into the room
5. they see pricing update live
6. they export a JSON file when they want a portable copy

This is simple and aligned with the stated architecture.

## 4.2 Returning visit with a local draft

The architecture explicitly requires a restore/discard decision on boot.

That means the first meaningful UI moment may be a modal:

- `Restore previous draft`
- `Discard draft and start fresh`

Important UX consequence:

The app should explain that the restored content is the browser working copy, not a file that has been saved somewhere permanent.

## 4.3 Adding and placing a module

Likely visible flow:

1. user finds a module in the catalog
2. planner enters placement mode
3. preview appears in the room
4. preview snaps to valid position
5. invalid positions show warning feedback
6. user confirms placement
7. module becomes selected
8. price updates immediately

This is the interaction where visual clarity matters most, because it combines catalog selection, geometry rules, and pricing feedback.

## 4.4 Editing a selected module

Likely visible flow:

1. click module in canvas
2. module highlight appears
3. selection panel populates with editable fields
4. changes update scene and price
5. local draft status remains visible in file bar

## 4.5 Exporting

Likely visible flow:

1. click `Export`
2. browser downloads a `.room-project.json` file
3. top bar changes from "has unexported changes" to a clean export status
4. toast confirms export

Important UX point:

The export action is the user's durable portable copy. It should be treated visually as a primary action, even though editing itself is local-first.

## 4.6 Importing

Likely visible flow:

1. click `Import`
2. choose JSON file
3. app validates file
4. if valid, current planner state is replaced
5. if invalid, modal explains why
6. imported project becomes current working state and is also written into local draft storage

Important UX point:

Import is destructive relative to the current in-memory workspace, so the warning dialog must be explicit.

## 5. Responsive understanding

The architecture plan does not say anything about mobile behavior, but the UI cannot avoid that question.

### Most likely responsive adaptation

Desktop should be the primary editing layout.

On smaller screens:

- the canvas remains the main area
- side panels collapse into tabs, drawers, or bottom sheets
- file actions compress into a tighter top bar or overflow menu
- price summary stays pinned or quickly reachable

### Sensible mobile arrangement

```text
+---------------------------------------------------+
| Project name | Export | menu                      |
+---------------------------------------------------+
| Room Canvas                                       |
| [toolbar overlay]                                 |
|                                                   |
+---------------------------------------------------+
| Tabs: Catalog | Room | Selection | Price          |
+---------------------------------------------------+
| Active bottom sheet / tab content                 |
+---------------------------------------------------+
```

### Gap

Because the architecture does not define responsive priorities, a future implementation could accidentally make the UI feel cramped or hide critical pricing and file-state signals on smaller screens.

## 6. Technical mapping from UI to architecture

| Visible UI area | Main component | Primary state/services behind it | User-visible responsibility |
|---|---|---|---|
| Global workspace | `PlannerPage` | `PlannerStore` | Compose the whole planning experience |
| Top file/status bar | `ProjectFileBar` | project metadata, dirty/export state, file services, draft cache | Explain project lifecycle and file actions |
| Room form | `RoomSetupPanel` | room state, validation | Define the room |
| Module library | `CatalogPanel` | `CatalogService`, local filter UI state | Let user find and add products |
| 3D planner | `RoomCanvas` | planner state, `PlacementEngine` | Place, move, rotate, and select modules |
| Object inspector | `SelectionPanel` | selected module, validation | Edit the current module precisely |
| Scene controls | `Toolbar` | canvas/view UI state | Navigate and inspect the scene |
| Pricing card | `PriceSummary` | `PricingEngine` | Show live commercial impact |
| Risk/restore/error overlays | `ImportExportDialogs` | file import, draft recovery, validation | Protect the user from destructive or confusing transitions |
| Short feedback | `ToastNotifications` | action result events | Confirm success or warn about minor issues |

## 7. UI-critical gaps in the architecture plan

These are not implementation details. They directly change what the user sees.

### 1. The room model is still unclear

If v1 supports only a simple rectangular room, the setup panel can stay small and the canvas stays simple.

If the product later supports corners, windows, doors, pillars, or wall segments, the entire planner becomes a more advanced CAD-like tool.

The plan needs one explicit sentence here.

### 2. Placement behavior is not defined tightly enough

Snap rules, rotation steps, anchor points, and placement confirmation behavior all become visible immediately in the canvas and inspector.

Without that definition, the UI cannot be fully specified.

### 3. The editable module fields are unresolved

The selection panel depends on knowing exactly what can change per module:

- size
- material
- orientation
- handedness
- position

The plan does not yet define that contract clearly.

### 4. Pricing freshness after import is unresolved

The architecture stores `pricingSnapshot` in the file and also recalculates pricing on import.

If those differ, the UI needs a rule:

- show current recalculated price only
- show both current and imported snapshot
- warn about stale pricing

Right now that user-visible behavior is undefined.

### 5. The project status language is not precise enough

The file bar needs a clean model for:

- autosaved locally
- unexported changes
- last export time
- imported file source

The architecture mentions these ideas, but does not formalize them.

### 6. The `New` flow is missing

The top bar includes `New`, but the user-visible behavior is not defined:

- confirm before clearing current work
- reset project id or keep it
- clear export baseline or not
- what happens to current draft

This is a real UI flow and needs to be specified.

### 7. Autosave failure and multi-tab behavior are missing

If autosave fails or two tabs edit the same draft, the UI needs visible conflict/error handling.

The architecture is silent here.

### 8. The product promise about "what could be cheaper or more expensive" is not yet represented

The current architecture supports a transparent total and composition.

It does not yet support decision guidance.

That is a product-level UI omission, not just an engineering omission.

## 8. Recommended UI direction based on the current plan

If the team follows the current architecture cleanly, the best UI direction is:

- desktop-first planning workbench
- one persistent screen rather than a wizard
- large 3D canvas at the center
- file/status bar at the top with explicit local/export language
- room + catalog inputs on the left
- selection + price on the right
- dialogs for destructive transitions
- toasts for lightweight confirmations

## 9. Final summary

The architecture already implies a strong core UI: a local-first kitchen planner centered on an interactive room canvas with supporting catalog, inspector, and pricing panels.

That part is coherent.

What is still missing is not the broad layout, but the precise visible behavior at the edges:

- what exactly a room contains
- how placement behaves
- which module properties are editable
- how pricing drift is shown after import
- how project status is described without using misleading "save" language

So my current reading is:

- the macro UI is mostly clear
- the micro-interactions are not yet fully specified
- the product promise around live transparent pricing is strong
- the product promise around price-guidance and tradeoff suggestions is not yet represented in the architecture
