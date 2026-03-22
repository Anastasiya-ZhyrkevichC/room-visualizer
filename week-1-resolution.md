# Week 1 Resolution

Run these commands from the repository root (`/Users/anast/Documents/my_projects/room-visualizer`) to verify Week 1 implementation.

1. Install dependencies (if not already installed):

```bash
npm ci
```

2. Run full unit test suite (strict CI mode):

```bash
CI=true npm test -- --watch=false --runInBand
```

3. Run only pricing contract tests (formula, rounding, validation codes, golden fixture):

```bash
CI=true npm test -- --watch=false --runInBand src/domain/pricing/calculateQuote.test.js
```

4. Run catalog and schema contract tests:

```bash
CI=true npm test -- --watch=false --runInBand src/domain/catalog/catalog.v1.schema.test.js src/domain/catalog/catalogService.test.js
```

5. Run currency helper tests:

```bash
CI=true npm test -- --watch=false --runInBand src/lib/format/currency.test.js
```

6. Build production bundle to verify compile-time integrity:

```bash
npm run build
```

7. Verify required Week 1 exports exist:

```bash
rg -n "export function getCatalog|export function getMaterialByCode|export function getModuleById|export function getWidthOption|export function getAddonByCode|export class PricingValidationError|export function validateQuoteInput|export function calculateQuote|export function formatCurrencyFromCents" src/domain src/lib/format
```

8. Verify no UI dependencies were introduced in Week 1 domain files (command should return no matches):

```bash
rg -n "from \"react|from 'react|@react-three|@mui|three" src/domain src/lib/format || true
```
