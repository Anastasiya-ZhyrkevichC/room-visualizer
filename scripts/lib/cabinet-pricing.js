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

function createAreaStep({ areaM2, unitPricePerSquareMeter, coefficient, cost }) {
  if (!Number.isFinite(cost) || cost === 0) {
    return null;
  }

  const step = {
    areaM2: roundNumber(areaM2, 6),
    unitPricePerSquareMeter: roundNumber(unitPricePerSquareMeter, 4),
    cost: roundNumber(cost, 4),
  };

  if (Number.isFinite(coefficient) && coefficient !== 1) {
    step.coefficient = roundNumber(coefficient, 6);
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
  const carcaseCoefficient = (carcaseMaterial.coefficient ?? 1) * (profile.carcaseCoefficient ?? 1);
  const facadeCoefficient = (facadeMaterial.coefficient ?? 1) * (profile.facadeCoefficient ?? 1);
  const cabinetCoefficient = profile.cabinetCoefficient ?? 1;
  const bodyCost = areaM2ByGroup.body * carcaseMaterial.bodyPanelPricePerSquareMeter * carcaseCoefficient;
  const backPanelCost = areaM2ByGroup.backPanel * carcaseMaterial.backPanelPricePerSquareMeter * carcaseCoefficient;
  const shelfCost = areaM2ByGroup.shelf * carcaseMaterial.shelfPricePerSquareMeter * carcaseCoefficient;
  const totalBodyCost = bodyCost + backPanelCost + shelfCost;
  const facadeCost = areaM2ByGroup.facade * facadeMaterial.pricePerSquareMeter * facadeCoefficient;
  const handleCost = componentCounts.handleCount * (handle?.unitPrice ?? 0);
  const legCost = componentCounts.legCount * (leg?.unitPrice ?? 0);
  const hingeCost = componentCounts.doorHingeCount * (config.hardware?.doorHingeUnitPrice ?? 0);
  const drawerBoxCost = componentCounts.drawerBoxCount * (config.hardware?.drawerBoxUnitPrice ?? 0);
  const wallMountingKitCost = componentCounts.wallMountingKitCount * (config.hardware?.wallMountingKitPrice ?? 0);
  const tallReinforcementKitCost =
    componentCounts.tallReinforcementKitCount * (config.hardware?.tallReinforcementKitPrice ?? 0);
  const assemblyCost = profile.assemblyCost ?? 0;
  const extraFixedCost = profile.extraFixedCost ?? 0;
  const subtotal =
    totalBodyCost +
    facadeCost +
    handleCost +
    legCost +
    hingeCost +
    drawerBoxCost +
    wallMountingKitCost +
    tallReinforcementKitCost +
    assemblyCost +
    extraFixedCost;
  const totalBeforeRounding = subtotal * cabinetCoefficient;
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
    coefficients: {
      carcaseMaterial: carcaseMaterial.coefficient ?? 1,
      carcaseProfile: profile.carcaseCoefficient ?? 1,
      carcaseResolved: carcaseCoefficient,
      facadeMaterial: facadeMaterial.coefficient ?? 1,
      facadeProfile: profile.facadeCoefficient ?? 1,
      facadeResolved: facadeCoefficient,
      cabinet: cabinetCoefficient,
    },
    costs: {
      bodyCost,
      backPanelCost,
      shelfCost,
      totalBodyCost,
      facadeCost,
      handleCost,
      legCost,
      hingeCost,
      drawerBoxCost,
      wallMountingKitCost,
      tallReinforcementKitCost,
      assemblyCost,
      extraFixedCost,
      subtotal,
      totalBeforeRounding,
      roundedPrice,
    },
  };
}

function toSerializablePricingBreakdown(breakdown) {
  const serializable = {
    variantId: breakdown.variantId,
    steps: compactObjectEntries({
      bodyPanels: createAreaStep({
        areaM2: breakdown.measurements.areaM2ByGroup.body,
        unitPricePerSquareMeter: breakdown.inputs.carcaseMaterial.bodyPanelPricePerSquareMeter,
        coefficient: breakdown.coefficients.carcaseResolved,
        cost: breakdown.costs.bodyCost,
      }),
      backPanel: createAreaStep({
        areaM2: breakdown.measurements.areaM2ByGroup.backPanel,
        unitPricePerSquareMeter: breakdown.inputs.carcaseMaterial.backPanelPricePerSquareMeter,
        coefficient: breakdown.coefficients.carcaseResolved,
        cost: breakdown.costs.backPanelCost,
      }),
      shelves: createAreaStep({
        areaM2: breakdown.measurements.areaM2ByGroup.shelf,
        unitPricePerSquareMeter: breakdown.inputs.carcaseMaterial.shelfPricePerSquareMeter,
        coefficient: breakdown.coefficients.carcaseResolved,
        cost: breakdown.costs.shelfCost,
      }),
      facade: createAreaStep({
        areaM2: breakdown.measurements.areaM2ByGroup.facade,
        unitPricePerSquareMeter: breakdown.inputs.facadeMaterial.pricePerSquareMeter,
        coefficient: breakdown.coefficients.facadeResolved,
        cost: breakdown.costs.facadeCost,
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
      assembly: createFixedStep(breakdown.costs.assemblyCost),
      extraFixed: createFixedStep(breakdown.costs.extraFixedCost),
    }),
    subtotal: roundNumber(breakdown.costs.subtotal, 4),
    totalBeforeRounding: roundNumber(breakdown.costs.totalBeforeRounding, 4),
    roundedPrice: roundNumber(breakdown.costs.roundedPrice, 4),
  };

  if (breakdown.coefficients.cabinet !== 1) {
    serializable.cabinetCoefficient = roundNumber(breakdown.coefficients.cabinet, 6);
  }

  return serializable;
}

function buildPricingBreakdownDefinitions(catalog, config) {
  const currency = config.currency ?? catalog[0]?.currency ?? "USD";

  return {
    schemaVersion: 2,
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
