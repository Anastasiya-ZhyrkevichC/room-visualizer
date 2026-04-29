# Cabinet Pricing Workflow

This project keeps starter cabinet prices in:

- `src/features/cupboards/model/starterCabinetCatalogDefinitions.json`

You should not edit the `price` fields in that file by hand. Instead:

1. Update the pricing config in `config/cabinet-pricing.config.json`.
2. Run `npm run prices:update`.
3. Review the updated prices in `src/features/cupboards/model/starterCabinetCatalogDefinitions.json`.

## Config structure

The pricing config is split into a few clear sections:

- `materials.carcase`: base rates for cabinet body, back panel, and shelves.
- `materials.facade`: facade price tables and facade coefficients.
- `handles`: unit prices for each handle type.
- `legs`: unit prices for each leg type.
- `hardware`: shared hardware rates such as hinges, drawer boxes, wall mounting kits, and tall-cabinet reinforcement kits.
- `pricingProfiles`: which material and hardware setup each cabinet family should use.

Each cabinet in `starterCabinetCatalogDefinitions.json` has a `pricingProfileId`. The updater uses that profile to recalculate every variant price.

## Commands

Update catalog prices:

```bash
npm run prices:update
```

Check whether catalog prices are stale without rewriting files:

```bash
npm run prices:check
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
- per-profile assembly and fixed costs

After the subtotal is calculated, the script rounds the result using `rounding.nearest` from the config.
