# Essential Features For A Working Prototype

The project already has a solid base: room dimensions, a starter cabinet catalog, a 3D room shell, and basic cabinet selection with rotate/delete actions.

To turn it into a working prototype, these are the 5 essential features to finish next:

1. **Wall-aware cabinet placement**
   - Finish the drag-preview flow so a cabinet can be dropped onto a valid wall position and actually placed there.
   - Support at least the back wall plus the two side walls, with the cabinet snapped and oriented correctly.
   - This is the core interaction that makes the planner feel like a real kitchen tool instead of a scene demo.

2. **Cabinet movement with bounds and collision validation**
   - Let users reposition an existing cabinet along its wall after placement.
   - Prevent cabinets from leaving the room bounds or overlapping each other.
   - Show clear valid/invalid feedback before the move is committed.

3. **A believable starter kitchen catalog**
   - Expand the current small catalog into a prototype-ready set of modules such as base cabinets, drawer units, wall cabinets, tall units, and corner pieces.
   - Give each item stable data: name, category, dimensions, and fixed prototype pricing.
   - Without a credible catalog, the user cannot build a realistic kitchen layout.

4. **Live pricing summary**
   - Show the placed cabinets as line items with per-item prices and a running subtotal.
   - Update the total immediately when cabinets are added, removed, or replaced.
   - This is the main product value described in the project idea: transparent kitchen pricing without contacting a manager first.

Cases for Live pricing:
- If the company updates prices and a customer already exported a file, the file itself should still represent the old snapshot. An exported file should not silently change after export.
- If that file is later imported back into the tool, the user should see the new live price, plus a clear message that prices changed since export.
- If a module no longer exists in the new catalog, mark it as unavailable and make the recalculated total partial until the user resolves it.



5. **Project persistence with autosave and JSON import/export**
   - Save the working draft in the browser so a refresh does not destroy the layout.
   - Allow the user to export the project as JSON and import it later.
   - Add a simple project bar with `New`, `Import`, `Export`, and status text so the save behavior is clear.
