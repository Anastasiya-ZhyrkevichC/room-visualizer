# Week 2 (10h): Configurator UI and State

Objective: users can build kitchen configuration and see live totals.

## Tasks

1. Implement reducer + context store - 2.0h.
2. Build `ConfiguratorPanel` with:
   - module picker
   - line editor (width, qty, add-ons)
   - remove line
   - material selector - 4.0h.
3. Connect live totals (`TotalsBar`) using pricing selector - 1.5h.
4. Add room dimension inputs with validation (mm integers) - 1.0h.
5. Add draft save/restore via `localStorage` - 1.0h.
6. Add reducer/component tests (4-6 tests) - 0.5h.

## Acceptance Criteria

1. Add/edit/remove line works without page reload.
2. Total updates instantly after each change.
3. Draft persists after browser refresh.
4. Invalid fields show clear inline validation messages.

## Deliverables

- Usable configurator MVP in browser.

## Cut Line if Behind Schedule

- Remove add-ons UI first, keep module + width + qty + material only.
