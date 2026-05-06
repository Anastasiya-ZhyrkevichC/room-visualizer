#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const {
  DEFAULT_HOLE_RULES,
  getCabinetManufacturingData,
  toSerializableManufacturingData,
} = require("./lib/cabinet-manufacturing");

const CONFIG_PATH = path.resolve(__dirname, "../config/cabinet-pricing.config.json");
const CATALOG_PATH = path.resolve(__dirname, "../src/features/cupboards/model/starterCabinetCatalogDefinitions.json");
const OUTPUT_PATH = path.resolve(__dirname, "../config/cabinet-manufacturing.generated.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function buildManufacturingDefinitions(catalog, config) {
  return {
    schemaVersion: 1,
    units: {
      length: "mm",
      area: "mm2",
    },
    sources: {
      catalog: path.relative(process.cwd(), CATALOG_PATH),
      pricingConfig: path.relative(process.cwd(), CONFIG_PATH),
    },
    holeRules: {
      ...DEFAULT_HOLE_RULES,
      ...(config?.manufacturing?.holeRules ?? {}),
    },
    cabinets: catalog.map((cabinet) => ({
      cabinetId: cabinet.id,
      name: cabinet.name,
      category: cabinet.category,
      pricingProfileId: cabinet.pricingProfileId,
      activeVariantId: cabinet.activeVariantId ?? null,
      variants: cabinet.variants.map((variant) => {
        const manufacturingData = toSerializableManufacturingData(
          getCabinetManufacturingData({ cabinet, variant, config }),
        );

        return {
          variantId: manufacturingData.variantId,
          sizeMm: manufacturingData.sizeMm,
          panels: manufacturingData.panels,
          summary: manufacturingData.summary,
          holes: manufacturingData.holes,
        };
      }),
    })),
  };
}

function getDiffStatus(previousOutput, nextOutput) {
  return JSON.stringify(previousOutput) === JSON.stringify(nextOutput);
}

function main() {
  const isCheckMode = process.argv.includes("--check");
  const config = readJson(CONFIG_PATH);
  const catalog = readJson(CATALOG_PATH);
  const nextOutput = buildManufacturingDefinitions(catalog, config);
  const previousOutput = fs.existsSync(OUTPUT_PATH) ? readJson(OUTPUT_PATH) : null;
  const isUpToDate = previousOutput !== null && getDiffStatus(previousOutput, nextOutput);

  if (isUpToDate) {
    console.log("Cabinet manufacturing data is already up to date.");
    return;
  }

  if (isCheckMode) {
    console.error("Cabinet manufacturing data is out of date. Run `npm run manufacturing:update`.");
    process.exitCode = 1;
    return;
  }

  writeJson(OUTPUT_PATH, nextOutput);
  console.log(`Updated cabinet manufacturing data in ${path.relative(process.cwd(), OUTPUT_PATH)}.`);
}

main();
