#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const { buildPricingBreakdownDefinitions, getPricingBreakdown } = require("./lib/cabinet-pricing");

const CONFIG_PATH = path.resolve(__dirname, "../config/cabinet-pricing.config.json");
const CATALOG_PATH = path.resolve(__dirname, "../src/features/cupboards/model/starterCabinetCatalogDefinitions.json");
const BREAKDOWN_PATH = path.resolve(__dirname, "../config/cabinet-pricing.generated.json");

function buildUpdatedCatalog(definitions, config) {
  return definitions.map((cabinet) => ({
    ...cabinet,
    currency: config.currency ?? cabinet.currency ?? "USD",
    variants: cabinet.variants.map((variant) => {
      const price = getPricingBreakdown({ cabinet, variant, config });

      return {
        ...variant,
        price: price.costs.roundedPrice,
        bodyCost: price.costs.totalBodyCost,
      };
    }),
  }));
}

function getCatalogDiffSummary(previousDefinitions, nextDefinitions) {
  const changedLines = [];

  nextDefinitions.forEach((cabinet, cabinetIndex) => {
    const previousCabinet = previousDefinitions[cabinetIndex];

    cabinet.variants.forEach((variant, variantIndex) => {
      const previousVariant = previousCabinet?.variants?.[variantIndex];
      const previousPrice = previousVariant?.price ?? null;

      if (previousPrice !== variant.price) {
        const variantId = previousVariant?.id ?? variant.id ?? `${variant.width}x${variant.height}x${variant.depth}`;
        const delta = previousPrice === null ? variant.price : variant.price - previousPrice;
        const deltaLabel = delta > 0 ? `+${delta}` : String(delta);

        changedLines.push(
          `${cabinet.id} ${variantId}: ${previousPrice === null ? "null" : previousPrice} -> ${variant.price} (${deltaLabel})`,
        );
      }
    });
  });

  return changedLines;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function getDiffStatus(previousOutput, nextOutput) {
  return JSON.stringify(previousOutput) === JSON.stringify(nextOutput);
}

function main() {
  const isCheckMode = process.argv.includes("--check");
  const config = readJson(CONFIG_PATH);
  const previousDefinitions = readJson(CATALOG_PATH);
  const nextDefinitions = buildUpdatedCatalog(previousDefinitions, config);
  const nextBreakdownOutput = buildPricingBreakdownDefinitions(nextDefinitions, config);
  const previousBreakdownOutput = fs.existsSync(BREAKDOWN_PATH) ? readJson(BREAKDOWN_PATH) : null;
  const changedLines = getCatalogDiffSummary(previousDefinitions, nextDefinitions);
  const isBreakdownUpToDate =
    previousBreakdownOutput !== null && getDiffStatus(previousBreakdownOutput, nextBreakdownOutput);

  if (changedLines.length === 0 && isBreakdownUpToDate) {
    console.log("Cabinet pricing outputs are already up to date.");
    return;
  }

  if (isCheckMode) {
    console.error("Cabinet pricing outputs are out of date. Run `npm run prices:update`.");

    if (changedLines.length > 0) {
      changedLines.forEach((line) => console.error(`- ${line}`));
    }

    if (!isBreakdownUpToDate) {
      console.error(`- pricing breakdown: ${path.relative(process.cwd(), BREAKDOWN_PATH)} is missing or stale.`);
    }

    process.exitCode = 1;
    return;
  }

  if (changedLines.length > 0) {
    writeJson(CATALOG_PATH, nextDefinitions);
    console.log(
      `Updated ${changedLines.length} cabinet variant prices in ${path.relative(process.cwd(), CATALOG_PATH)}.`,
    );
    changedLines.forEach((line) => console.log(`- ${line}`));
  }

  if (!isBreakdownUpToDate) {
    writeJson(BREAKDOWN_PATH, nextBreakdownOutput);
    console.log(`Updated cabinet pricing breakdowns in ${path.relative(process.cwd(), BREAKDOWN_PATH)}.`);
  }
}

main();
