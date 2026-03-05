# Technical Plan: Common Constraints and Recommendations

## 1. Goal

This plan is based on `mds/main_idea.md`:

- Customer can configure a kitchen from standard modules.
- Customer sees transparent pricing immediately.
- Customer can request contact only after seeing price.

## 2. Constraints

- Team size: 1 person (implementation by another agent).
- Capacity: 10 hours/week.
- Timeline: 4 weeks (40 hours total).
- Current codebase: React + CRA + MUI + react-three-fiber prototype.

## 3. Release Scope

## Must Have (P0)

1. Standard module catalog (5-8 module types, fixed dimensions).
2. Material selection with price multiplier.
3. Configurator UI (add/edit/remove modules, quantity).
4. Deterministic pricing engine with line-by-line and grand totals.
5. Quote summary with transparent breakdown.
6. Lead capture form with attached configuration snapshot.
7. Deployment (public URL) + basic analytics events.

## Should Have (P1, if time remains)

1. Minimal 3D preview synced from configuration.
2. Save/restore draft from `localStorage`.
3. Shareable quote link via encoded state in URL.

## Out of Scope (Do Not Build in This Release)

1. Free-form 3D drag/drop placement.
2. Collision and intersection engine.
3. Multi-wall/L-shape/U-shape layouts.
4. User accounts and authentication.
5. Full CRM integration.
6. 2D CAD/export pipeline.

## 4. Common Technical Recommendations

## Frontend Stack

- Keep current stack: React (CRA), JavaScript, MUI.
- No TypeScript migration in this 4-week window.
- Add JSDoc type annotations to core pricing functions for clarity.

## Proposed Source Structure

```text
src/
  app/
    AppLayout.jsx
  domain/
    catalog/
      catalog.v1.json
      catalogService.js
    pricing/
      calculateQuote.js
      pricingValidation.js
  features/
    configurator/
      ConfiguratorPanel.jsx
      ModuleLineEditor.jsx
      MaterialSelector.jsx
      TotalsBar.jsx
    quote/
      QuoteSummary.jsx
    lead/
      LeadForm.jsx
  state/
    configuratorReducer.js
    ConfiguratorContext.jsx
  lib/
    format/
      currency.js
    storage/
      draftStorage.js
    analytics/
      events.js
  adapters/
    scene/
      configToScene.js
```

Use this as target structure. Existing files can be reused and migrated incrementally.

## 5. Data Model

## Catalog (`src/domain/catalog/catalog.v1.json`)

```json
{
  "version": "1.0.0",
  "currency": "USD",
  "materials": [
    { "code": "LAMINATE", "name": "Laminate", "multiplierBps": 10000 },
    { "code": "MDF", "name": "Painted MDF", "multiplierBps": 11800 },
    { "code": "VENEER", "name": "Veneer", "multiplierBps": 13200 }
  ],
  "modules": [
    {
      "id": "BASE_STANDARD",
      "name": "Base Cabinet",
      "category": "BASE",
      "heightMm": 720,
      "depthMm": 560,
      "widthOptions": [
        { "widthMm": 400, "basePriceCents": 12000 },
        { "widthMm": 600, "basePriceCents": 14500 },
        { "widthMm": 800, "basePriceCents": 17800 }
      ],
      "addons": [
        { "code": "SOFT_CLOSE", "name": "Soft-close", "priceCents": 2500 }
      ]
    }
  ],
  "fees": {
    "deliveryFlatCents": 12000,
    "installationPercentBps": 1000,
    "taxPercentBps": 0
  }
}
```

Notes:

- Use integer money (`*_cents`) and basis points (`*_bps`) only.
- No float math for pricing.

## Quote Model (in state and submission payload)

```json
{
  "quoteId": "uuid",
  "createdAtIso": "2026-03-05T12:00:00.000Z",
  "layout": "SINGLE_WALL",
  "room": { "lengthMm": 5000, "widthMm": 4000, "heightMm": 3000 },
  "materialCode": "LAMINATE",
  "lines": [
    {
      "lineId": "uuid",
      "moduleId": "BASE_STANDARD",
      "widthMm": 600,
      "qty": 2,
      "addonCodes": ["SOFT_CLOSE"]
    }
  ],
  "totals": {
    "subtotalCents": 0,
    "materialAdjustedSubtotalCents": 0,
    "installationCents": 0,
    "deliveryCents": 0,
    "taxCents": 0,
    "grandTotalCents": 0
  }
}
```

## 6. Pricing Engine Contract

File: `src/domain/pricing/calculateQuote.js`

```js
/**
 * @param {Object} input
 * @param {Object} input.catalog
 * @param {string} input.materialCode
 * @param {Array} input.lines
 * @returns {{
 *   linesDetailed: Array,
 *   totals: {
 *     subtotalCents: number,
 *     materialAdjustedSubtotalCents: number,
 *     installationCents: number,
 *     deliveryCents: number,
 *     taxCents: number,
 *     grandTotalCents: number
 *   }
 * }}
 */
export function calculateQuote(input) {}
```

Pricing formula:

1. For each line, resolve module and width option.
2. `unitBaseCents = widthOption.basePriceCents + sum(addons.priceCents)`.
3. `unitMaterialAdjustedCents = round(unitBaseCents * materialMultiplierBps / 10000)`.
4. `lineTotalCents = unitMaterialAdjustedCents * qty`.
5. `materialAdjustedSubtotalCents = sum(lineTotalCents)`.
6. `installationCents = round(materialAdjustedSubtotalCents * installationPercentBps / 10000)`.
7. `grandTotalCents = materialAdjustedSubtotalCents + installationCents + delivery + tax`.

Validation rules (`pricingValidation.js`):

- `qty` integer in `[1..20]`.
- `widthMm` must exist for module.
- `moduleId`, `materialCode`, `addonCodes` must exist in catalog.
- Throw typed errors with codes:
  - `INVALID_MODULE`
  - `INVALID_WIDTH`
  - `INVALID_MATERIAL`
  - `INVALID_ADDON`
  - `INVALID_QTY`

## 7. State, Persistence, and Lead Capture

## State Management

Use `useReducer` + context:

- File: `src/state/configuratorReducer.js`
- Actions:
  - `SET_ROOM_DIMENSIONS`
  - `SET_MATERIAL`
  - `ADD_LINE`
  - `UPDATE_LINE`
  - `REMOVE_LINE`
  - `RESET_CONFIG`
  - `HYDRATE_DRAFT`

Derived data:

- Compute totals from pricing engine via memoized selector.
- Never keep duplicated total values in mutable state.

## Persistence

File: `src/lib/storage/draftStorage.js`

- Key: `room-visualizer:draft:v1`
- Save on debounced changes (500ms).
- Restore on app init.
- Include schema version in payload for forward compatibility.

## Lead Capture

Primary path for MVP:

- Deploy on Netlify and use Netlify Forms.
- `LeadForm` posts:
  - `name`, `email`, `phone`, `comment`.
  - `quote_payload_json` (stringified quote model).
  - `quote_total_display` (formatted).

Fallback path if not on Netlify:

- Replace form submit with webhook endpoint (Formspree or custom serverless function).

## 8. Testing Strategy

## Unit Tests (Required)

Target files:

- `calculateQuote.js`
- `pricingValidation.js`
- `configuratorReducer.js`
- serializer/deserializer helpers

Minimum cases:

1. Valid line calculation with material multiplier.
2. Add-on pricing composition.
3. Multiple lines aggregation.
4. Installation and delivery fee calculation.
5. Invalid width/module/material/addon/qty.
6. Rounding behavior (basis points math).

## Integration Tests (Required)

1. Add module -> change width -> total updates.
2. Remove line -> total decreases correctly.
3. Refresh restores draft.
4. Submit lead form includes serialized quote.

## Manual QA Checklist (Week 4)

1. Empty state UX is clear.
2. Validation messages are understandable.
3. Currency and number formatting are consistent.
4. Mobile layout remains usable (<=390px width).
5. Slow network simulation keeps user feedback visible.

## 9. Analytics Events (Minimal)

Implement event helper with no hard dependency on vendor:

- `config_started`
- `module_added`
- `module_removed`
- `material_changed`
- `quote_viewed`
- `lead_submit_success`
- `lead_submit_failure`

If no analytics key exists, helper should no-op safely.

## 10. Risk Register and Mitigations

1. Risk: scope creep into advanced 3D interaction.
   - Mitigation: 3D is preview-only; estimator is primary product.
2. Risk: pricing bugs reduce trust.
   - Mitigation: integer money, typed validation, unit tests first.
3. Risk: deployment/form integration delays.
   - Mitigation: choose Netlify forms early in week 3.
4. Risk: UI complexity for one person.
   - Mitigation: reusable line-editor component and strict non-goals.

## 11. Implementation Rules for the Other Agent

1. Do not refactor entire existing 3D code unless required by P0.
2. Land work in small vertical slices (domain -> UI -> integration).
3. Each PR must include:
   - what changed
   - test evidence
   - cut lines taken (if any)
4. Preserve backward compatibility of saved drafts with versioned key.
5. If behind by >2 hours in any week, execute that week's cut line immediately.

## 12. Definition of Release Done

Release is done when all are true:

1. User can configure single-wall kitchen with standard modules.
2. Price breakdown is transparent and mathematically consistent.
3. User can submit contact info with quote snapshot.
4. App is deployed publicly and tested in production.
5. Known limitations are documented.

## 13. Questions / Comments

Use this section for questions and decisions:

- [ ] Q1:
- [ ] Q2:
- [ ] Q3:
