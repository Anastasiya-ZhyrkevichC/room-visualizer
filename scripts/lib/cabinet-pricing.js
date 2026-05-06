const {
  getCabinetManufacturingData,
  getPricingProfile,
  getVariantId,
  roundNumber,
  toSquareMeters,
} = require("./cabinet-manufacturing");

function roundPrice(value, step) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  if (!Number.isFinite(step) || step <= 0) {
    return Math.round(value);
  }

  return Math.round(value / step) * step;
}

function toLinearMeters(lengthMm) {
  return lengthMm / 1_000;
}

function createAreaStep({
  areaM2,
  unitPricePerSquareMeter,
  panelCost,
  edgeLengthM,
  edgeBandingPricePerMeter,
  edgeCost,
  cost,
}) {
  if (!Number.isFinite(cost) || cost === 0) {
    return null;
  }

  const step = {
    areaM2: roundNumber(areaM2, 6),
    cost: roundNumber(cost, 4),
  };

  if (Number.isFinite(unitPricePerSquareMeter)) {
    step.unitPricePerSquareMeter = roundNumber(unitPricePerSquareMeter, 4);
  }

  if (Number.isFinite(panelCost) && panelCost !== cost) {
    step.panelCost = roundNumber(panelCost, 4);
  }

  if (Number.isFinite(edgeCost) && edgeCost > 0) {
    step.edgeLengthM = roundNumber(edgeLengthM, 6);
    step.edgeBandingPricePerMeter = roundNumber(edgeBandingPricePerMeter, 4);
    step.edgeCost = roundNumber(edgeCost, 4);
  }

  return step;
}

function createCountStep({ count, unitPrice, cost }) {
  if (!Number.isFinite(cost) || cost === 0) {
    return null;
  }

  return {
    count: roundNumber(count, 0),
    unitPrice: roundNumber(unitPrice, 4),
    cost: roundNumber(cost, 4),
  };
}

function createFixedStep(cost) {
  if (!Number.isFinite(cost) || cost === 0) {
    return null;
  }

  return {
    cost: roundNumber(cost, 4),
  };
}

function compactObjectEntries(record) {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== null));
}

function getPricingBreakdown({ cabinet, variant, config }) {
  const profile = getPricingProfile(cabinet, config);
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

  const manufacturing = getCabinetManufacturingData({ cabinet, variant, config });
  const componentCounts = {
    ...manufacturing.summary.componentCounts,
  };
  const areaMm2ByGroup = {
    body: manufacturing.summary.areaMm2ByGroup.body ?? 0,
    backPanel: manufacturing.summary.areaMm2ByGroup.backPanel ?? 0,
    shelf: manufacturing.summary.areaMm2ByGroup.shelf ?? 0,
    facade: manufacturing.summary.areaMm2ByGroup.facade ?? 0,
  };
  const areaM2ByGroup = {
    body: toSquareMeters(areaMm2ByGroup.body),
    backPanel: toSquareMeters(areaMm2ByGroup.backPanel),
    shelf: toSquareMeters(areaMm2ByGroup.shelf),
    facade: toSquareMeters(areaMm2ByGroup.facade),
  };
  const edgeBandingLengthMmByGroup = {
    body: manufacturing.summary.edgeBandingLengthMmByGroup.body ?? 0,
    backPanel: manufacturing.summary.edgeBandingLengthMmByGroup.backPanel ?? 0,
    shelf: manufacturing.summary.edgeBandingLengthMmByGroup.shelf ?? 0,
    facade: manufacturing.summary.edgeBandingLengthMmByGroup.facade ?? 0,
  };
  const edgeLengthMByGroup = {
    body: toLinearMeters(edgeBandingLengthMmByGroup.body),
    backPanel: toLinearMeters(edgeBandingLengthMmByGroup.backPanel),
    shelf: toLinearMeters(edgeBandingLengthMmByGroup.shelf),
    facade: toLinearMeters(edgeBandingLengthMmByGroup.facade),
  };
  const bodyCost = areaM2ByGroup.body * carcaseMaterial.bodyPanelPricePerSquareMeter;
  const backPanelCost = areaM2ByGroup.backPanel * carcaseMaterial.backPanelPricePerSquareMeter;
  const shelfCost = areaM2ByGroup.shelf * carcaseMaterial.shelfPricePerSquareMeter;
  const bodyPanelsAreaM2 = areaM2ByGroup.body + areaM2ByGroup.shelf;
  const bodyPanelsPanelCost = bodyCost + shelfCost;
  const bodyPanelsEdgeLengthM = edgeLengthMByGroup.body + edgeLengthMByGroup.shelf;
  const bodyEdgeBandingCost = bodyPanelsEdgeLengthM * (carcaseMaterial.edgeBandingPricePerMeter ?? 0);
  const totalBodyPanelsCost = bodyPanelsPanelCost + bodyEdgeBandingCost;
  const facadeCost = areaM2ByGroup.facade * facadeMaterial.pricePerSquareMeter;
  const facadeEdgeLengthM = edgeLengthMByGroup.facade;
  const facadeEdgeBandingCost = facadeEdgeLengthM * (facadeMaterial.edgeBandingPricePerMeter ?? 0);
  const totalFacadeCost = facadeCost + facadeEdgeBandingCost;
  const handleCost = componentCounts.handleCount * (handle?.unitPrice ?? 0);
  const legCost = componentCounts.legCount * (leg?.unitPrice ?? 0);
  const hingeCost = componentCounts.doorHingeCount * (config.hardware?.doorHingeUnitPrice ?? 0);
  const drawerBoxCost = componentCounts.drawerBoxCount * (config.hardware?.drawerBoxUnitPrice ?? 0);
  const wallMountingKitCost = componentCounts.wallMountingKitCount * (config.hardware?.wallMountingKitPrice ?? 0);
  const tallReinforcementKitCost =
    componentCounts.tallReinforcementKitCount * (config.hardware?.tallReinforcementKitPrice ?? 0);
  const extraFixedCost = profile.extraFixedCost ?? 0;
  const subtotal =
    totalBodyPanelsCost +
    backPanelCost +
    totalFacadeCost +
    handleCost +
    legCost +
    hingeCost +
    drawerBoxCost +
    wallMountingKitCost +
    tallReinforcementKitCost +
    extraFixedCost;
  const totalBeforeRounding = subtotal;
  const roundingNearest = config.rounding?.nearest ?? null;
  const roundedPrice = roundPrice(totalBeforeRounding, roundingNearest);

  return {
    cabinetId: cabinet.id,
    cabinetName: cabinet.name,
    category: cabinet.category,
    pricingProfileId: cabinet.pricingProfileId,
    variantId: getVariantId(variant),
    sizeMm: {
      width: variant.width,
      height: variant.height,
      depth: variant.depth,
    },
    currency: config.currency ?? cabinet.currency ?? "USD",
    pricingProfile: {
      ...profile,
    },
    measurements: {
      areaMm2ByGroup,
      areaM2ByGroup,
      edgeBandingLengthMmByGroup,
      edgeLengthMByGroup,
      bodyPanelsAreaM2,
      bodyPanelsEdgeLengthM,
      facadeEdgeLengthM,
    },
    componentCounts,
    inputs: {
      carcaseMaterial: {
        ...carcaseMaterial,
      },
      facadeMaterial: {
        ...facadeMaterial,
      },
      handle: handle ? { ...handle } : null,
      leg: leg ? { ...leg } : null,
      hardware: {
        doorHingeUnitPrice: config.hardware?.doorHingeUnitPrice ?? 0,
        drawerBoxUnitPrice: config.hardware?.drawerBoxUnitPrice ?? 0,
        wallMountingKitPrice: config.hardware?.wallMountingKitPrice ?? 0,
        tallReinforcementKitPrice: config.hardware?.tallReinforcementKitPrice ?? 0,
      },
      rounding: {
        nearest: Number.isFinite(roundingNearest) ? roundingNearest : null,
      },
    },
    costs: {
      bodyCost,
      backPanelCost,
      shelfCost,
      bodyPanelsPanelCost,
      bodyEdgeBandingCost,
      totalBodyPanelsCost,
      facadeCost,
      facadeEdgeBandingCost,
      totalFacadeCost,
      handleCost,
      legCost,
      hingeCost,
      drawerBoxCost,
      wallMountingKitCost,
      tallReinforcementKitCost,
      extraFixedCost,
      subtotal,
      totalBeforeRounding,
      roundedPrice,
    },
  };
}

function toSerializablePricingBreakdown(breakdown) {
  const mergedBodyUnitPrice =
    breakdown.inputs.carcaseMaterial.bodyPanelPricePerSquareMeter ===
    breakdown.inputs.carcaseMaterial.shelfPricePerSquareMeter
      ? breakdown.inputs.carcaseMaterial.bodyPanelPricePerSquareMeter
      : undefined;
  const serializable = {
    variantId: breakdown.variantId,
    steps: compactObjectEntries({
      bodyPanels: createAreaStep({
        areaM2: breakdown.measurements.bodyPanelsAreaM2,
        unitPricePerSquareMeter: mergedBodyUnitPrice,
        panelCost: breakdown.costs.bodyPanelsPanelCost,
        edgeLengthM: breakdown.measurements.bodyPanelsEdgeLengthM,
        edgeBandingPricePerMeter: breakdown.inputs.carcaseMaterial.edgeBandingPricePerMeter ?? 0,
        edgeCost: breakdown.costs.bodyEdgeBandingCost,
        cost: breakdown.costs.totalBodyPanelsCost,
      }),
      backPanel: createAreaStep({
        areaM2: breakdown.measurements.areaM2ByGroup.backPanel,
        unitPricePerSquareMeter: breakdown.inputs.carcaseMaterial.backPanelPricePerSquareMeter,
        panelCost: breakdown.costs.backPanelCost,
        cost: breakdown.costs.backPanelCost,
      }),
      facade: createAreaStep({
        areaM2: breakdown.measurements.areaM2ByGroup.facade,
        unitPricePerSquareMeter: breakdown.inputs.facadeMaterial.pricePerSquareMeter,
        panelCost: breakdown.costs.facadeCost,
        edgeLengthM: breakdown.measurements.facadeEdgeLengthM,
        edgeBandingPricePerMeter: breakdown.inputs.facadeMaterial.edgeBandingPricePerMeter ?? 0,
        edgeCost: breakdown.costs.facadeEdgeBandingCost,
        cost: breakdown.costs.totalFacadeCost,
      }),
      handles: createCountStep({
        count: breakdown.componentCounts.handleCount,
        unitPrice: breakdown.inputs.handle?.unitPrice ?? 0,
        cost: breakdown.costs.handleCost,
      }),
      legs: createCountStep({
        count: breakdown.componentCounts.legCount,
        unitPrice: breakdown.inputs.leg?.unitPrice ?? 0,
        cost: breakdown.costs.legCost,
      }),
      hinges: createCountStep({
        count: breakdown.componentCounts.doorHingeCount,
        unitPrice: breakdown.inputs.hardware.doorHingeUnitPrice,
        cost: breakdown.costs.hingeCost,
      }),
      drawerBoxes: createCountStep({
        count: breakdown.componentCounts.drawerBoxCount,
        unitPrice: breakdown.inputs.hardware.drawerBoxUnitPrice,
        cost: breakdown.costs.drawerBoxCost,
      }),
      wallMountingKits: createCountStep({
        count: breakdown.componentCounts.wallMountingKitCount,
        unitPrice: breakdown.inputs.hardware.wallMountingKitPrice,
        cost: breakdown.costs.wallMountingKitCost,
      }),
      tallReinforcementKits: createCountStep({
        count: breakdown.componentCounts.tallReinforcementKitCount,
        unitPrice: breakdown.inputs.hardware.tallReinforcementKitPrice,
        cost: breakdown.costs.tallReinforcementKitCost,
      }),
      extraFixed: createFixedStep(breakdown.costs.extraFixedCost),
    }),
    subtotal: roundNumber(breakdown.costs.subtotal, 4),
    totalBeforeRounding: roundNumber(breakdown.costs.totalBeforeRounding, 4),
    roundedPrice: roundNumber(breakdown.costs.roundedPrice, 4),
  };

  return serializable;
}

function buildPricingBreakdownDefinitions(catalog, config) {
  const currency = config.currency ?? catalog[0]?.currency ?? "USD";

  return {
    schemaVersion: 3,
    currency,
    roundingNearest: Number.isFinite(config.rounding?.nearest) ? roundNumber(config.rounding.nearest, 4) : null,
    cabinets: catalog.map((cabinet) => ({
      cabinetId: cabinet.id,
      variants: cabinet.variants.map((variant) =>
        toSerializablePricingBreakdown(getPricingBreakdown({ cabinet, variant, config })),
      ),
    })),
  };
}

module.exports = {
  buildPricingBreakdownDefinitions,
  getPricingBreakdown,
  roundPrice,
  toSerializablePricingBreakdown,
};
