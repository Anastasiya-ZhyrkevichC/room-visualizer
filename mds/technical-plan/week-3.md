# Week 3 (10h): Quote Summary and Lead Capture

Objective: user can review quote and submit interest with full config context.

## Tasks

1. Build `QuoteSummary` component:
   - line-by-line table
   - fees breakdown
   - grand total - 2.5h.
2. Implement quote snapshot serializer (`quote_payload_json`) - 1.0h.
3. Build `LeadForm` with validation - 2.0h.
4. Integrate Netlify form submit path and success/failure UI - 2.0h.
5. Implement simple analytics event wrapper (`events.js`) - 1.0h.
6. Add tests for quote rendering + payload shape - 1.5h.

## Acceptance Criteria

1. Quote page shows complete transparent breakdown.
2. Lead form sends payload with configuration snapshot.
3. Success and error states are visible to user.
4. `quote_payload_json` can reconstruct the same quote offline.

## Deliverables

- End-to-end quote -> lead workflow.

## Cut Line if Behind Schedule

- Remove shareable URL feature.
- Keep only one submission channel.
