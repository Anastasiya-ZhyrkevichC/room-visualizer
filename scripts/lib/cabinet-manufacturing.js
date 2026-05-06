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

const DEFAULT_HOLE_RULES = Object.freeze({
  handleMountHolesPerHandle: 2,
  hingeCupHolesPerHinge: 1,
  shelfSupportHolesPerShelf: 4,
  legMountHolesPerLeg: 4,
  drawerSlideMountHolesPerDrawer: 8,
  wallMountHolesPerKit: 4,
  tallReinforcementMountHolesPerKit: 4,
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

function roundNumber(value, decimals = 2) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function sumNumbers(values = []) {
  return values.reduce((runningTotal, value) => runningTotal + (Number.isFinite(value) ? value : 0), 0);
}

function getResolvedCountByWidth(width, countByWidth = [], fallback = 0) {
  if (!Array.isArray(countByWidth) || countByWidth.length === 0) {
    return fallback;
  }

  const sortedRules = [...countByWidth].sort(
    (firstRule, secondRule) => (firstRule?.minWidth ?? 0) - (secondRule?.minWidth ?? 0),
  );

  return sortedRules.reduce(
    (resolvedCount, rule) => (width >= (rule?.minWidth ?? 0) ? (rule?.count ?? resolvedCount) : resolvedCount),
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

function getVariantId(variant) {
  return variant?.id ?? `${variant?.width}x${variant?.height}x${variant?.depth}`;
}

function getPricingProfile(cabinet, config) {
  const profile = config?.pricingProfiles?.[cabinet?.pricingProfileId];

  if (!profile) {
    throw new Error(`Unknown pricingProfileId "${cabinet?.pricingProfileId}" for cabinet "${cabinet?.id}".`);
  }

  return profile;
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

function createPanel({ name, materialGroup, sizeMm, thicknessMm, edgeLengthByName = {}, edgeBandingEdges = [] }) {
  const [width, height] = sizeMm;
  const edgeBanding = edgeBandingEdges.map((edgeName) => ({
    edge: edgeName,
    lengthMm: edgeLengthByName[edgeName] ?? 0,
  }));

  return {
    name,
    materialGroup,
    sizeMm,
    thicknessMm,
    areaMm2: width * height,
    perimeterMm: 2 * (width + height),
    edgeBanding,
    edgeBandingLengthMm: sumNumbers(edgeBanding.map((edge) => edge.lengthMm)),
  };
}

function getBodyPanels(metrics) {
  const sideEdgeLengths = {
    front: metrics.carcassHeight,
    back: metrics.carcassHeight,
    top: metrics.depth,
    bottom: metrics.depth,
  };
  const horizontalEdgeLengths = {
    front: metrics.interiorWidth,
    back: metrics.interiorWidth,
    left: metrics.depth,
    right: metrics.depth,
  };
  const shelfEdgeLengths = {
    front: metrics.interiorWidth,
    back: metrics.interiorWidth,
    left: metrics.interiorDepth,
    right: metrics.interiorDepth,
  };

  return [
    createPanel({
      name: "left-side",
      materialGroup: "body",
      sizeMm: [metrics.depth, metrics.carcassHeight],
      thicknessMm: metrics.shellThickness,
      edgeLengthByName: sideEdgeLengths,
      edgeBandingEdges: ["front"],
    }),
    createPanel({
      name: "right-side",
      materialGroup: "body",
      sizeMm: [metrics.depth, metrics.carcassHeight],
      thicknessMm: metrics.shellThickness,
      edgeLengthByName: sideEdgeLengths,
      edgeBandingEdges: ["front"],
    }),
    createPanel({
      name: "bottom-panel",
      materialGroup: "body",
      sizeMm: [metrics.interiorWidth, metrics.depth],
      thicknessMm: metrics.shellThickness,
      edgeLengthByName: horizontalEdgeLengths,
      edgeBandingEdges: ["front"],
    }),
    createPanel({
      name: "top-panel",
      materialGroup: "body",
      sizeMm: [metrics.interiorWidth, metrics.depth],
      thicknessMm: metrics.shellThickness,
      edgeLengthByName: horizontalEdgeLengths,
      edgeBandingEdges: ["front"],
    }),
    createPanel({
      name: "back-panel",
      materialGroup: "backPanel",
      sizeMm: [metrics.interiorWidth, metrics.backPanelHeight],
      thicknessMm: metrics.backPanelThickness,
    }),
    ...Array.from({ length: Math.max(metrics.model.shelfCount ?? 0, 0) }, (_, index) =>
      createPanel({
        name: `shelf-${index + 1}`,
        materialGroup: "shelf",
        sizeMm: [metrics.interiorWidth, metrics.interiorDepth],
        thicknessMm: metrics.shellThickness,
        edgeLengthByName: shelfEdgeLengths,
        edgeBandingEdges: ["front"],
      }),
    ),
  ];
}

function getFacadePanels(metrics) {
  const { width, carcassHeight, frontThickness, frontReveal, gap, model } = metrics;

  if (model.front?.hasFacade === false || model.front === null) {
    return [];
  }

  if (model.front?.type === "drawers") {
    const drawerCount = Math.max(model.front?.drawerCount ?? 3, 1);
    const availableHeight = Math.max(carcassHeight - frontReveal * 2 - gap * (drawerCount - 1), carcassHeight / 3);
    const drawerHeight = availableHeight / drawerCount;
    const drawerWidth = Math.max(width - frontReveal * 2, frontThickness);
    const edgeLengths = {
      top: drawerWidth,
      right: drawerHeight,
      bottom: drawerWidth,
      left: drawerHeight,
    };

    return Array.from({ length: drawerCount }, (_, index) =>
      createPanel({
        name: `drawer-front-${index + 1}`,
        materialGroup: "facade",
        sizeMm: [drawerWidth, drawerHeight],
        thicknessMm: frontThickness,
        edgeLengthByName: edgeLengths,
        edgeBandingEdges: ["top", "right", "bottom", "left"],
      }),
    );
  }

  const doorCount = Math.max(model.front?.doorCount ?? 2, 1);
  const availableWidth = Math.max(width - frontReveal * 2 - gap * (doorCount - 1), width / 4);
  const doorWidth = availableWidth / doorCount;
  const doorHeight = Math.max(carcassHeight - frontReveal * 2, frontThickness);
  const edgeLengths = {
    top: doorWidth,
    right: doorHeight,
    bottom: doorWidth,
    left: doorHeight,
  };

  return Array.from({ length: doorCount }, (_, index) =>
    createPanel({
      name: `door-${index + 1}`,
      materialGroup: "facade",
      sizeMm: [doorWidth, doorHeight],
      thicknessMm: frontThickness,
      edgeLengthByName: edgeLengths,
      edgeBandingEdges: ["top", "right", "bottom", "left"],
    }),
  );
}

function getComponentCounts(metrics, profile) {
  const doorCount =
    metrics.model.front?.type === "drawers" || metrics.model.front?.hasFacade === false || metrics.model.front === null
      ? 0
      : Math.max(metrics.model.front?.doorCount ?? 2, 1);
  const drawerCount = metrics.model.front?.type === "drawers" ? Math.max(metrics.model.front?.drawerCount ?? 0, 0) : 0;
  const handleCount = profile.handleId ? getCountFromMode(metrics.model, profile.handleCountMode) : 0;
  const legCount = profile.legId ? getResolvedCountByWidth(metrics.width, profile.legCountByWidth, 0) : 0;
  const drawerBoxCount = getCountFromMode(metrics.model, profile.drawerBoxCountMode);

  return {
    shelfCount: Math.max(metrics.model.shelfCount ?? 0, 0),
    doorCount,
    drawerCount,
    handleCount,
    legCount,
    doorHingeCount: (profile.doorHingeCountPerDoor ?? 0) * doorCount,
    drawerBoxCount,
    wallMountingKitCount: profile.wallMountingKitCount ?? 0,
    tallReinforcementKitCount: profile.tallReinforcementKitCount ?? 0,
  };
}

function getHoleBreakdown(componentCounts, config) {
  const holeRules = {
    ...DEFAULT_HOLE_RULES,
    ...(config?.manufacturing?.holeRules ?? {}),
  };
  const byType = {
    handleMount: componentCounts.handleCount * holeRules.handleMountHolesPerHandle,
    hingeCup: componentCounts.doorHingeCount * holeRules.hingeCupHolesPerHinge,
    shelfSupport: componentCounts.shelfCount * holeRules.shelfSupportHolesPerShelf,
    legMount: componentCounts.legCount * holeRules.legMountHolesPerLeg,
    drawerSlideMount: componentCounts.drawerBoxCount * holeRules.drawerSlideMountHolesPerDrawer,
    wallMount: componentCounts.wallMountingKitCount * holeRules.wallMountHolesPerKit,
    tallReinforcementMount: componentCounts.tallReinforcementKitCount * holeRules.tallReinforcementMountHolesPerKit,
  };

  return {
    totalCount: sumNumbers(Object.values(byType)),
    byType,
    rules: holeRules,
  };
}

function buildPanelSummary(panels, componentCounts) {
  const summary = {
    panelCount: panels.length,
    panelCountByGroup: {},
    areaMm2ByGroup: {},
    cutPerimeterMmByGroup: {},
    edgeBandingLengthMmByGroup: {},
    totalAreaMm2: 0,
    totalCutPerimeterMm: 0,
    totalEdgeBandingLengthMm: 0,
    componentCounts,
  };

  panels.forEach((panel) => {
    const group = panel.materialGroup;

    summary.panelCountByGroup[group] = (summary.panelCountByGroup[group] ?? 0) + 1;
    summary.areaMm2ByGroup[group] = (summary.areaMm2ByGroup[group] ?? 0) + panel.areaMm2;
    summary.cutPerimeterMmByGroup[group] = (summary.cutPerimeterMmByGroup[group] ?? 0) + panel.perimeterMm;
    summary.edgeBandingLengthMmByGroup[group] =
      (summary.edgeBandingLengthMmByGroup[group] ?? 0) + panel.edgeBandingLengthMm;
    summary.totalAreaMm2 += panel.areaMm2;
    summary.totalCutPerimeterMm += panel.perimeterMm;
    summary.totalEdgeBandingLengthMm += panel.edgeBandingLengthMm;
  });

  return summary;
}

function getCabinetManufacturingData({ cabinet, variant, config }) {
  const profile = getPricingProfile(cabinet, config);
  const metrics = getCabinetMetrics(variant, cabinet.category, cabinet.model);
  const panels = [...getBodyPanels(metrics), ...getFacadePanels(metrics)];
  const componentCounts = getComponentCounts(metrics, profile);
  const holes = getHoleBreakdown(componentCounts, config);
  const summary = buildPanelSummary(panels, componentCounts);

  return {
    cabinetId: cabinet.id,
    cabinetName: cabinet.name,
    category: cabinet.category,
    pricingProfileId: cabinet.pricingProfileId,
    variantId: getVariantId(variant),
    sizeMm: {
      width: metrics.width,
      height: metrics.height,
      depth: metrics.depth,
    },
    panels,
    summary,
    holes,
  };
}

function roundPanel(panel) {
  return {
    ...panel,
    sizeMm: panel.sizeMm.map((value) => roundNumber(value)),
    thicknessMm: roundNumber(panel.thicknessMm),
    areaMm2: roundNumber(panel.areaMm2),
    perimeterMm: roundNumber(panel.perimeterMm),
    edgeBanding: panel.edgeBanding.map((edge) => ({
      edge: edge.edge,
      lengthMm: roundNumber(edge.lengthMm),
    })),
    edgeBandingLengthMm: roundNumber(panel.edgeBandingLengthMm),
  };
}

function roundRecord(record, decimals = 2) {
  return Object.fromEntries(
    Object.entries(record ?? {}).map(([key, value]) => [
      key,
      Number.isFinite(value) ? roundNumber(value, decimals) : value,
    ]),
  );
}

function toSerializableManufacturingData(manufacturingData) {
  return {
    ...manufacturingData,
    sizeMm: {
      width: roundNumber(manufacturingData.sizeMm.width),
      height: roundNumber(manufacturingData.sizeMm.height),
      depth: roundNumber(manufacturingData.sizeMm.depth),
    },
    panels: manufacturingData.panels.map(roundPanel),
    summary: {
      ...manufacturingData.summary,
      areaMm2ByGroup: roundRecord(manufacturingData.summary.areaMm2ByGroup),
      cutPerimeterMmByGroup: roundRecord(manufacturingData.summary.cutPerimeterMmByGroup),
      edgeBandingLengthMmByGroup: roundRecord(manufacturingData.summary.edgeBandingLengthMmByGroup),
      totalAreaMm2: roundNumber(manufacturingData.summary.totalAreaMm2),
      totalCutPerimeterMm: roundNumber(manufacturingData.summary.totalCutPerimeterMm),
      totalEdgeBandingLengthMm: roundNumber(manufacturingData.summary.totalEdgeBandingLengthMm),
    },
    holes: {
      totalCount: roundNumber(manufacturingData.holes.totalCount, 0),
      byType: roundRecord(manufacturingData.holes.byType, 0),
    },
  };
}

module.exports = {
  DEFAULT_HOLE_RULES,
  getCabinetManufacturingData,
  getCabinetMetrics,
  getPricingProfile,
  getResolvedCountByWidth,
  getCountFromMode,
  getVariantId,
  mergeCabinetModel,
  resolveCabinetModel,
  roundNumber,
  sumNumbers,
  toSerializableManufacturingData,
  toSquareMeters,
};
