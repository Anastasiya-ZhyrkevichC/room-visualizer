#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.resolve(__dirname, "../config/cabinet-pricing.config.json");
const CATALOG_PATH = path.resolve(
  __dirname,
  "../src/features/cupboards/model/starterCabinetCatalogDefinitions.json",
);

const DEFAULT_HANDLE = Object.freeze({
  orientation: "vertical",
  lengthMm: 160,
  thicknessMm: 12,
  projectionMm: 24,
  insetMm: 44,
});

const DEFAULT_FRONT = Object.freeze({
  type: "doubleDoor",
  hasFacade: true,
  gapMm: 4,
  doorCount: 2,
  drawerCount: 3,
  handle: DEFAULT_HANDLE,
});

const DEFAULT_LEGS = Object.freeze({
  enabled: true,
  heightMm: 100,
  widthMm: 34,
  depthMm: 34,
  insetMm: 56,
});

const DEFAULT_CABINET_MODEL = Object.freeze({
  shellThicknessMm: 18,
  backPanelThicknessMm: 6,
  frontThicknessMm: 18,
  shelfCount: 1,
  front: DEFAULT_FRONT,
  legs: DEFAULT_LEGS,
});

const CATEGORY_CABINET_MODELS = Object.freeze({
  base: mergeCabinetModel(DEFAULT_CABINET_MODEL, {
    shelfCount: 1,
    front: {
      type: "doubleDoor",
    },
    legs: {
      enabled: true,
    },
  }),
  drawer: mergeCabinetModel(DEFAULT_CABINET_MODEL, {
    shelfCount: 0,
    front: {
      type: "drawers",
      drawerCount: 3,
      handle: {
        orientation: "horizontal",
        lengthMm: 192,
        insetMm: 0,
      },
    },
    legs: {
      enabled: true,
    },
  }),
  tall: mergeCabinetModel(DEFAULT_CABINET_MODEL, {
    shelfCount: 4,
    legs: null,
    front: {
      type: "doubleDoor",
      handle: {
        lengthMm: 224,
        insetMm: 52,
      },
    },
  }),
  wall: mergeCabinetModel(DEFAULT_CABINET_MODEL, {
    shelfCount: 1,
    legs: null,
  }),
  corner: mergeCabinetModel(DEFAULT_CABINET_MODEL, {
    shelfCount: 2,
  }),
});

function mergeHandle(baseHandle = DEFAULT_HANDLE, handle) {
  if (handle === null) {
    return null;
  }

  return {
    ...baseHandle,
    ...(handle ?? {}),
  };
}

function mergeFront(baseFront = DEFAULT_FRONT, front) {
  if (front === null) {
    return null;
  }

  if (front === undefined && baseFront === null) {
    return null;
  }

  const resolvedBaseFront = baseFront ?? DEFAULT_FRONT;

  return {
    ...resolvedBaseFront,
    ...(front ?? {}),
    handle: mergeHandle(resolvedBaseFront.handle, front?.handle),
  };
}

function mergeLegs(baseLegs = DEFAULT_LEGS, legs) {
  if (legs === null) {
    return null;
  }

  if (legs === undefined && baseLegs === null) {
    return null;
  }

  const resolvedBaseLegs = baseLegs ?? DEFAULT_LEGS;

  return {
    ...resolvedBaseLegs,
    ...(legs ?? {}),
  };
}

function mergeCabinetModel(baseModel = DEFAULT_CABINET_MODEL, overrides = {}) {
  return {
    ...baseModel,
    ...overrides,
    front: mergeFront(baseModel.front, overrides.front),
    legs: mergeLegs(baseModel.legs, overrides.legs),
  };
}

function getDefaultCabinetModel(category) {
  return CATEGORY_CABINET_MODELS[category] ?? DEFAULT_CABINET_MODEL;
}

function resolveCabinetModel(category, overrides) {
  return mergeCabinetModel(getDefaultCabinetModel(category), overrides ?? {});
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function toSquareMeters(areaMm2) {
  return areaMm2 / 1_000_000;
}

function roundPrice(value, step) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  if (!Number.isFinite(step) || step <= 0) {
    return Math.round(value);
  }

  return Math.round(value / step) * step;
}

function getResolvedCountByWidth(width, countByWidth = [], fallback = 0) {
  if (!Array.isArray(countByWidth) || countByWidth.length === 0) {
    return fallback;
  }

  const sortedRules = [...countByWidth].sort(
    (firstRule, secondRule) => (firstRule?.minWidth ?? 0) - (secondRule?.minWidth ?? 0),
  );

  return sortedRules.reduce(
    (resolvedCount, rule) => (width >= (rule?.minWidth ?? 0) ? rule?.count ?? resolvedCount : resolvedCount),
    fallback,
  );
}

function getCountFromMode(model, mode) {
  if (mode === "doorCount") {
    return Math.max(model.front?.doorCount ?? 0, 0);
  }

  if (mode === "drawerCount") {
    return Math.max(model.front?.drawerCount ?? 0, 0);
  }

  if (mode === "single") {
    return 1;
  }

  return 0;
}

function getCabinetMetrics(variant, category, modelOverrides) {
  const model = resolveCabinetModel(category, modelOverrides);
  const width = variant.width;
  const height = variant.height;
  const depth = variant.depth;
  const shellThickness = clamp(model.shellThicknessMm, 8, Math.min(width, height, depth) / 4);
  const backPanelThickness = clamp(model.backPanelThicknessMm, 4, depth / 6);
  const frontThickness = clamp(model.frontThicknessMm, 8, depth / 3);
  const gap = clamp(model.front?.gapMm ?? 4, 1.5, Math.min(width, height) * 0.05);
  const legsEnabled = model.legs?.enabled === true;
  const legHeight = legsEnabled ? clamp(model.legs.heightMm, 40, height * 0.28) : 0;
  const carcassHeight = Math.max(height - legHeight, shellThickness * 3);
  const interiorWidth = Math.max(width - shellThickness * 2, shellThickness);
  const interiorHeight = Math.max(carcassHeight - shellThickness * 2, shellThickness);
  const frontReveal = gap / 2;
  const interiorBackDepthOffset = -depth / 2 + backPanelThickness;
  const interiorFrontDepthOffset =
    model.front && model.front.hasFacade !== false ? depth / 2 - frontThickness - frontReveal : depth / 2 - frontReveal;
  const interiorDepth = Math.max(interiorFrontDepthOffset - interiorBackDepthOffset, shellThickness);
  const backPanelHeight = Math.max(carcassHeight - shellThickness * 2, shellThickness);

  return {
    width,
    height,
    depth,
    shellThickness,
    backPanelThickness,
    frontThickness,
    gap,
    frontReveal,
    legHeight,
    carcassHeight,
    interiorWidth,
    interiorHeight,
    interiorDepth,
    backPanelHeight,
    model,
  };
}

function getFrontArea(metrics) {
  const { width, carcassHeight, frontThickness, frontReveal, gap, model } = metrics;

  if (model.front?.hasFacade === false || model.front === null) {
    return 0;
  }

  if (model.front?.type === "drawers") {
    const drawerCount = Math.max(model.front?.drawerCount ?? 3, 1);
    const availableHeight = Math.max(carcassHeight - frontReveal * 2 - gap * (drawerCount - 1), carcassHeight / 3);
    const drawerHeight = availableHeight / drawerCount;
    const drawerWidth = Math.max(width - frontReveal * 2, frontThickness);

    return toSquareMeters(drawerCount * drawerWidth * drawerHeight);
  }

  const doorCount = Math.max(model.front?.doorCount ?? 2, 1);
  const availableWidth = Math.max(width - frontReveal * 2 - gap * (doorCount - 1), width / 4);
  const doorWidth = availableWidth / doorCount;
  const doorHeight = Math.max(carcassHeight - frontReveal * 2, frontThickness);

  return toSquareMeters(doorCount * doorWidth * doorHeight);
}

function getPricingBreakdown({ cabinet, variant, config }) {
  const profile = config.pricingProfiles[cabinet.pricingProfileId];

  if (!profile) {
    throw new Error(`Unknown pricingProfileId "${cabinet.pricingProfileId}" for cabinet "${cabinet.id}".`);
  }

  const carcaseMaterial = config.materials?.carcase?.[profile.carcaseMaterialId];
  const facadeMaterial = config.materials?.facade?.[profile.facadeMaterialId];
  const handle = profile.handleId ? config.handles?.[profile.handleId] : null;
  const leg = profile.legId ? config.legs?.[profile.legId] : null;

  if (!carcaseMaterial) {
    throw new Error(`Unknown carcase material "${profile.carcaseMaterialId}" for cabinet "${cabinet.id}".`);
  }

  if (!facadeMaterial) {
    throw new Error(`Unknown facade material "${profile.facadeMaterialId}" for cabinet "${cabinet.id}".`);
  }

  if (profile.handleId && !handle) {
    throw new Error(`Unknown handle "${profile.handleId}" for cabinet "${cabinet.id}".`);
  }

  if (profile.legId && !leg) {
    throw new Error(`Unknown leg "${profile.legId}" for cabinet "${cabinet.id}".`);
  }

  const metrics = getCabinetMetrics(variant, cabinet.category, cabinet.model);
  const bodyAreaM2 = toSquareMeters(metrics.carcassHeight * metrics.depth * 2 + metrics.interiorWidth * metrics.depth * 2);
  const backPanelAreaM2 = toSquareMeters(metrics.interiorWidth * metrics.backPanelHeight);
  const shelfAreaM2 = toSquareMeters(metrics.interiorWidth * metrics.interiorDepth * Math.max(metrics.model.shelfCount ?? 0, 0));
  const frontAreaM2 = getFrontArea(metrics);
  const handleCount = handle ? getCountFromMode(metrics.model, profile.handleCountMode) : 0;
  const legCount = leg ? getResolvedCountByWidth(metrics.width, profile.legCountByWidth, 0) : 0;
  const doorHingeCount =
    (profile.doorHingeCountPerDoor ?? 0) * getCountFromMode(metrics.model, profile.handleCountMode === "drawerCount" ? "none" : "doorCount");
  const drawerBoxCount = getCountFromMode(metrics.model, profile.drawerBoxCountMode);
  const wallMountingKitCount = profile.wallMountingKitCount ?? 0;
  const tallReinforcementKitCount = profile.tallReinforcementKitCount ?? 0;

  const carcaseCoefficient = (carcaseMaterial.coefficient ?? 1) * (profile.carcaseCoefficient ?? 1);
  const facadeCoefficient = (facadeMaterial.coefficient ?? 1) * (profile.facadeCoefficient ?? 1);

  const bodyCost = bodyAreaM2 * carcaseMaterial.bodyPanelPricePerSquareMeter * carcaseCoefficient;
  const backPanelCost = backPanelAreaM2 * carcaseMaterial.backPanelPricePerSquareMeter * carcaseCoefficient;
  const shelfCost = shelfAreaM2 * carcaseMaterial.shelfPricePerSquareMeter * carcaseCoefficient;
  const facadeCost = frontAreaM2 * facadeMaterial.pricePerSquareMeter * facadeCoefficient;
  const handleCost = handleCount * (handle?.unitPrice ?? 0);
  const legCost = legCount * (leg?.unitPrice ?? 0);
  const hingeCost = doorHingeCount * (config.hardware?.doorHingeUnitPrice ?? 0);
  const drawerBoxCost = drawerBoxCount * (config.hardware?.drawerBoxUnitPrice ?? 0);
  const wallMountingKitCost = wallMountingKitCount * (config.hardware?.wallMountingKitPrice ?? 0);
  const tallReinforcementKitCost = tallReinforcementKitCount * (config.hardware?.tallReinforcementKitPrice ?? 0);
  const assemblyCost = profile.assemblyCost ?? 0;
  const extraFixedCost = profile.extraFixedCost ?? 0;

  const subtotal =
    bodyCost +
    backPanelCost +
    shelfCost +
    facadeCost +
    handleCost +
    legCost +
    hingeCost +
    drawerBoxCost +
    wallMountingKitCost +
    tallReinforcementKitCost +
    assemblyCost +
    extraFixedCost;

  return {
    roundedPrice: roundPrice(subtotal * (profile.cabinetCoefficient ?? 1), config.rounding?.nearest),
    subtotal,
    bodyAreaM2,
    backPanelAreaM2,
    shelfAreaM2,
    frontAreaM2,
    handleCount,
    legCount,
  };
}

function buildUpdatedCatalog(definitions, config) {
  return definitions.map((cabinet) => ({
    ...cabinet,
    currency: config.currency ?? cabinet.currency ?? "USD",
    variants: cabinet.variants.map((variant) => ({
      ...variant,
      price: getPricingBreakdown({ cabinet, variant, config }).roundedPrice,
    })),
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

function main() {
  const isCheckMode = process.argv.includes("--check");
  const config = readJson(CONFIG_PATH);
  const previousDefinitions = readJson(CATALOG_PATH);
  const nextDefinitions = buildUpdatedCatalog(previousDefinitions, config);
  const changedLines = getCatalogDiffSummary(previousDefinitions, nextDefinitions);

  if (changedLines.length === 0) {
    console.log("Cabinet prices are already up to date.");
    return;
  }

  if (isCheckMode) {
    console.error("Cabinet prices are out of date. Run `npm run prices:update`.");
    changedLines.forEach((line) => console.error(`- ${line}`));
    process.exitCode = 1;
    return;
  }

  writeJson(CATALOG_PATH, nextDefinitions);
  console.log(`Updated ${changedLines.length} cabinet variant prices in ${path.relative(process.cwd(), CATALOG_PATH)}.`);
  changedLines.forEach((line) => console.log(`- ${line}`));
}

main();
