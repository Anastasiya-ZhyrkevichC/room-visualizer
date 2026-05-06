# Cabinet Pricing Workflow

This project keeps starter cabinet prices in:

- `src/features/cupboards/model/starterCabinetCatalogDefinitions.json`

You should not edit the `price` fields in that file by hand. Instead:

1. Update the pricing config in `config/cabinet-pricing.config.json`.
2. Run `npm run prices:update`.
3. Review the updated prices in `src/features/cupboards/model/starterCabinetCatalogDefinitions.json`.
4. Review the generated breakdowns in `config/cabinet-pricing.generated.json`.

The project can also generate derived manufacturing data in:

- `config/cabinet-manufacturing.generated.json`

And script-level pricing breakdown data in:

- `config/cabinet-pricing.generated.json`

## Config structure

The pricing config is split into a few clear sections:

- `materials.carcase`: base rates for cabinet body, back panel, and shelves.
- `materials.facade`: facade price tables and edge-banding rates.
- `handles`: unit prices for each handle type.
- `legs`: unit prices for each leg type.
- `hardware`: shared hardware rates such as hinges, drawer boxes, wall mounting kits, and tall-cabinet reinforcement kits.
- `manufacturing.holeRules`: default drilling assumptions used when generating manufacturing metadata.
- `pricingProfiles`: which material and hardware setup each cabinet family should use.

Each cabinet in `starterCabinetCatalogDefinitions.json` has a `pricingProfileId`. The updater uses that profile to recalculate every variant price.

## Commands

Update catalog prices:

```bash
npm run prices:update
```

Check whether the catalog prices and generated pricing breakdowns are stale without rewriting files:

```bash
npm run prices:check
```

Generate manufacturing metadata for panels, edge banding, panel cut perimeter, and holes:

```bash
npm run manufacturing:update
```

Check whether the manufacturing metadata file is stale:

```bash
npm run manufacturing:check
```

## What the updater recalculates

For each cabinet variant, the script derives a new price from:

- carcase body panels
- back panel
- shelves
- facade area
- handle count
- leg count
- shared hardware
- per-profile fixed costs
- edge banding for carcase body/shelves and facades

After the subtotal is calculated, the script rounds the result using `rounding.nearest` from the config.

The same command also writes a compact pricing-breakdown JSON file with, for each cabinet variant:

- only the price-relevant steps that actually affect that cabinet
- area-based steps with area, per-square-meter rate, optional edging cost, and resulting cost
- count-based steps with count, unit price, and resulting cost
- subtotal, total before rounding, and final rounded price

## What the manufacturing generator outputs

For each cabinet variant, the generator derives:

- a panel list with dimensions, perimeter, and visible edge-banding length
- per-group totals for panel area, cut perimeter, and edge-banding length
- hole counts by operation type and as a cabinet-level total
