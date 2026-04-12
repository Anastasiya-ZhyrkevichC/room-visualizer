# Existing Competitor UI Reference

This document captures the UI patterns visible in the competitor kitchen constructor and translates them into a practical brief for our UI designer.

Reference basis:

- Screenshot 1: room setup / room elements state
- Screenshot 2: kitchen module catalog state
- Public interaction patterns cross-checked against a similar 3D kitchen constructor guide: [Baucenter guide](https://baucenter.ru/publication/kak-rabotat-s-konstruktorom-kukhon/)

Important note:

- We should use this as a structural and interaction reference, not as a request to copy branding, icons, or exact visual styling.
- Where behavior is not fully visible in the screenshots, this document marks it as `Inferred`.

## Reading guide

- `Observed`: clearly visible in the screenshots.
- `Inferred`: very likely based on the visible UI and common 3D planner behavior.
- `Recommended for our version`: what the designer should preserve or improve for our product.

## 1. Overall product shape

The competitor UI is not a marketing page. It is a planner workspace.

Core layout pattern:

- Left vertical navigation rail for top-level work areas
- Left content drawer for categories, filters, and draggable items
- Large central 3D scene for room and kitchen composition
- Right vertical utility rail for view, save, and project actions
- Floating top CTA for requesting a quote or submitting the design

`Observed`:

- The 3D canvas gets most of the screen.
- The interface is tool-like and operational, not decorative.
- Most controls are icon-driven.

`Recommended for our version`:

- Keep the same workspace logic: left = content, center = scene, right = utilities.
- Do not keep the same level of ambiguity in icon-only controls. Our version should add clear tooltips and, where possible, text labels.
- Make price visibility stronger than the competitor. Price is central to our product value.

## 2. Visual direction the designer should take from this reference

`Observed`:

- Dark charcoal header blocks
- Blue gradient side navigation
- Pale blue content panel backgrounds
- Neutral grey scene background
- White or light icons on dark surfaces
- Large, simple, industrial UI blocks

The competitor feels like a practical construction tool:

- high information density
- minimal decoration
- persistent navigation
- strong contrast between navigation and workspace

`Recommended for our version`:

- Preserve the "digital workbench" feeling.
- Avoid copying the exact brand blue, logo treatment, or icon set.
- Improve readability with stronger typography, better spacing, and explicit labels for novice users.

## 3. Main screen regions

### 3.1 Left vertical navigation rail

`Observed`:

- A hamburger menu button at the top
- A stack of icon buttons beneath it
- Lower utility icons near the bottom such as settings and help
- The active section is highlighted with a darker blue state

Top-level work areas visible or strongly suggested by the screenshots:

- Room / construction elements
- Kitchen or furniture catalog
- Lighting / decor
- Structural or project sections
- Information / help
- Settings
- Help / FAQ

`Inferred`:

- Clicking an icon swaps the content shown in the left drawer.
- Hovering likely reveals a tooltip or label.

`Recommended for our version`:

- Keep the left rail because it supports fast switching between work areas.
- Add text on hover and an optional expanded mode with labels.
- Make the active state stronger than the competitor by using both color and shape.

### 3.2 Left content drawer

`Observed`:

- The drawer has a dark header with a section title and a back arrow.
- Content below the header is scrollable.
- Items are grouped into accordion sections.
- The drawer can show either room-related elements or kitchen module catalogs.

Two major states are visible in the screenshots:

- `Room elements` state
- `Kitchen catalog` state

### 3.3 Central 3D workspace

`Observed`:

- A large 3D room occupies the center and right side of the screen.
- The room shows walls, floor material, and structural geometry.
- The camera is positioned in perspective view.

`Inferred`:

- The room is the drop target for elements dragged from the left panel.
- Users can orbit, zoom, and pan the scene.

`Recommended for our version`:

- Keep the 3D workspace dominant.
- Always show enough empty space around the room so drag-and-drop feels safe and understandable.
- Show selection states and snapping guides more clearly than the competitor.

### 3.4 Right utility rail

`Observed`:

- A dark vertical action bar sits on the far right.
- It contains icon-only actions.
- Visible actions appear to include help/account, fullscreen, view mode, layers, edit mode, cabinet/door-related view, visibility/preview, save, and open/load.

`Inferred`:

- Some icons are toggles and others open dialogs or panels.

`Recommended for our version`:

- Keep the idea of a compact right-side utility rail.
- Add tooltips and active-state labels.
- Group actions visually into view controls, project controls, and support/help controls.

### 3.5 Floating top CTA

`Observed`:

- There is a floating blue call-to-action card at the top of the workspace.
- Text visible in the screenshots: "Оформить заявку / Заказать расчет".

Meaning for our product:

- The planner is directly connected to a quote request or lead form.

`Recommended for our version`:

- Keep a persistent quote CTA.
- Add a price summary near this CTA or attach a live subtotal to it.
- The CTA should work from any planner state without forcing the user to finish every detail first.

## 4. Menus and element possibilities

### 4.1 Room elements menu

This state is visible in Screenshot 1.

Section title:

- `ЭЛЕМЕНТЫ ПОМЕЩЕНИЯ` / Room elements

Visible accordion groups:

- `ЭЛЕМЕНТЫ ПОМЕЩЕНИЯ`
- `ТЕХНИКА`
- `ДВЕРИ И ОКНА`
- `ЭЛЕКТРИКА`
- `КОМУНИКАЦИИ`

Visible element tiles:

- Room setup
- Wall and floor decor
- Lighting
- Sockets and switches
- Ventilation grille
- Pipe
- Radiator

What this means for our designer:

- The room menu is not only for raw dimensions.
- It includes construction, surfaces, openings, electrical points, and utility infrastructure.

Element possibilities we should support in our version:

- Set room dimensions
- Define room shape or structural constraints
- Add windows and doors
- Add columns, partitions, or obstacles if supported
- Apply wall finish
- Apply floor finish
- Place lighting points
- Place sockets and switches
- Place radiators, vents, and pipes

`Recommended for our version`:

- This area should feel like "build the room envelope first".
- Separate room geometry from decoration visually, even if both stay in the same top-level work area.
- Use larger thumbnails and clearer labels than the competitor.

### 4.2 Kitchen catalog menu

This state is visible in Screenshot 2.

Header title:

- `КУХНИ GENERAL`

Visible controls near the top:

- A filter entry field or filter button
- Two dropdown-like controls that appear to filter by dimensions or type
- A grid/list toggle or alternative display toggle

Visible accordion groups:

- Lower hinged sections
- Lower hinged sections, depth 300 mm
- Lower pull-out sections
- Lower pull-out sections with drying rack
- Lower open sections
- Lower corner / joint sections
- Lower elements
- Upper hinged sections
- Upper sections with upward opening
- Upper corner sections

Visible behaviors:

- Each group displays an item count
- Expanding a group reveals module thumbnails
- The thumbnails represent standardized cabinet modules

Meaning for our designer:

- The competitor organizes kitchen modules primarily by cabinet role and opening type.
- The catalog is modular, repetitive, and optimized for quick picking rather than storytelling.

Element possibilities we should support in our version:

- Base cabinets
- Wall cabinets
- Corner cabinets
- Open shelves
- Drawer units
- Narrow-depth units
- Sink or drying modules
- Appliance-ready modules
- End units and filler elements

`Inferred`:

- Modules likely vary by width, height, depth, opening direction, and facade type.
- Some project-level options may change finishes globally.

`Recommended for our version`:

- Keep the cabinet taxonomy because it is useful for fast selection.
- Add stronger filtering by width, type, purpose, and price.
- Make each card show at least:
  - thumbnail
  - module name
  - dimensions
  - starting price
  - quick add action

### 4.3 Decor and finish possibilities

`Observed`:

- Room decor is explicitly present through the "wall and floor decor" tile.

`Inferred`:

- Kitchen decor and facade materials can likely be changed globally or per element.
- Countertop, plinth, handles, and facade finish are likely configurable in another menu state.

This matters for our version because price transparency depends on configurable finishes.

Recommended designer expectation:

- Global decor controls for the whole project
- Per-item overrides for selected modules
- Clear distinction between structural options and decorative options

## 5. Interaction model

This section is the most important for implementation alignment between design and engineering.

### 5.1 Navigation interactions

Expected interaction pattern:

- Click a left-rail icon to switch the active workspace section.
- The content drawer updates immediately.
- The selected icon remains visually highlighted.
- Hover shows a tooltip.

Designer requirements:

- Active state must be visible without relying only on color.
- Tooltips should appear quickly and not block adjacent icons.
- The drawer title should always confirm where the user is.

### 5.2 Accordion interactions

Observed / expected pattern:

- Click a category row to expand or collapse it.
- Expanded groups reveal element thumbnails.
- Category rows show the number of available items.

Designer requirements:

- Keep the click target large.
- Animate expand/collapse lightly so the state change is understandable.
- Preserve scroll position when opening multiple groups.

### 5.3 Catalog card interactions

Expected interaction pattern:

- Hover highlights the card.
- Click selects the card and may show details.
- Dragging a card into the scene places a module or enters placement mode.

Designer requirements:

- The card should communicate drag capability clearly.
- Provide visual feedback during drag: ghost preview, snap outline, valid / invalid drop state.
- On touch devices, fall back to tap-then-place because classic drag-and-drop is weaker there.

### 5.4 3D scene interactions

Public guidance for similar planners indicates this control pattern:

- Right mouse button: rotate / orbit the camera
- Mouse wheel: zoom
- Middle mouse button: pan

Additional expected interactions:

- Left click on an object selects it
- Dragging a selected object repositions it
- Objects snap to walls, corners, or neighboring modules
- Invalid positions should show warning feedback

Designer requirements:

- Selection should be unmistakable
- Placement preview should appear before drop
- Camera instructions should be discoverable for first-time users
- Do not hide critical editing actions behind unexplained gestures

### 5.5 Object editing interactions

`Inferred`:

- After a module is placed, users can edit it through a panel or contextual controls.

Expected editable properties in our version:

- width
- height
- depth
- opening direction
- material / facade
- countertop participation
- appliance insert or cutout options
- delete
- duplicate
- rotate

Designer requirements:

- The user must always know whether they are editing the whole kitchen or one selected cabinet.
- Global changes and local changes need visually different affordances.

### 5.6 Right utility rail interactions

Expected interaction pattern:

- View controls toggle immediately
- Save and open actions launch dialogs
- Help actions open onboarding, FAQ, or support
- Some buttons should behave as toggles with active states

Designer requirements:

- Every icon on the right rail needs a tooltip.
- Toggle buttons must show on/off state clearly.
- Save/open should be separated visually from camera/view actions.

### 5.7 Quote and order interactions

Observed:

- Quote CTA is always present at the top of the planner.

Expected behavior for our version:

- Clicking the CTA opens a form or side sheet
- The current kitchen configuration is attached automatically
- The user can request a quote without losing the current project

Designer requirements:

- Show the current project name and subtotal in the quote flow
- Do not force the user to re-enter obvious project information
- Let the user continue editing after submitting the request

## 6. UX strengths worth keeping

- Strong desktop planner layout
- Large scene area
- Fast switching between room setup and kitchen modules
- Modular catalog grouped by meaningful cabinet types
- Persistent action area for quote requests

## 7. UX weaknesses we should improve

- Too many icon-only controls
- Low clarity about what some right-side actions mean
- Weak visibility of pricing in the visible screens
- Heavy dependence on hover knowledge and desktop behavior
- Some categories appear dense and intimidating for first-time users

## 8. Design requirements for our version

These points should guide the final UI design, even if we stay close to the competitor structure.

- Keep the same broad planner layout.
- Keep left-side catalog and room setup organization.
- Keep a large central 3D workspace.
- Keep a persistent quote CTA.
- Add a persistent price summary or subtotal.
- Add text labels, tooltips, and stronger onboarding.
- Make the difference between room editing, module editing, and project-level styling explicit.
- Make drag-and-drop and placement feedback more obvious than in the competitor UI.
- Treat save/load as first-class actions because our users need to continue projects later.

## 9. Suggested designer deliverables

The UI designer should produce:

- A desktop planner layout for the main workspace
- Left rail icon system with labels and active states
- Left drawer designs for:
  - room elements
  - kitchen catalog
  - decor / materials
  - filters
- Catalog card states: default, hover, selected, dragging
- 3D scene overlays: selected object, placement preview, invalid placement
- Right utility rail with grouped actions and tooltips
- Quote / request side sheet or modal
- Persistent pricing component

## 10. Summary

The competitor interface is a desktop-first kitchen planning workspace built around a simple rule:

- configure the room on the left
- place and edit kitchen modules in the center
- manage scene and project actions on the right
- keep a quote action available at all times

For our product, the designer should preserve this workbench structure, while making the experience clearer, more explicit, and more pricing-oriented than the competitor.
