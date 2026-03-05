# Week 1 (10h): Domain Foundation and Pricing Core

Objective: build reliable pricing core before UI complexity.

## Tasks

1. Create catalog schema and initial data (`catalog.v1.json`) - 2.0h.
2. Implement catalog loader/helpers (`catalogService.js`) - 1.0h.
3. Implement pricing validation (`pricingValidation.js`) - 2.0h.
4. Implement pricing engine (`calculateQuote.js`) - 2.0h.
5. Add currency formatting helper (`currency.js`) - 0.5h.
6. Unit tests for pricing and validation (8-12 tests) - 2.5h.

## Acceptance Criteria

1. Pricing output is deterministic and integer-based.
2. Invalid inputs throw typed validation errors.
3. Tests pass locally:
   - `npm test -- --watch=false`

## Deliverables

- Domain layer merged with tests.
- No UI dependency required yet.

## Cut Line if Behind Schedule

- Reduce addons to 1 per module type.
- Keep 5 module types maximum.
