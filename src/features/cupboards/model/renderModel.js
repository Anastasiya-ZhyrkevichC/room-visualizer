const defaultHandle = Object.freeze({
  orientation: "vertical",
  lengthMm: 160,
  thicknessMm: 12,
  projectionMm: 24,
  insetMm: 44,
});

const defaultFront = Object.freeze({
  type: "doubleDoor",
  hasFacade: true,
  gapMm: 4,
  doorCount: 2,
  drawerCount: 3,
  handle: defaultHandle,
});

const defaultLegs = Object.freeze({
  enabled: true,
  heightMm: 100,
  widthMm: 34,
  depthMm: 34,
  insetMm: 56,
});

export const defaultCabinetModel = Object.freeze({
  shellThicknessMm: 18,
  backPanelThicknessMm: 6,
  frontThicknessMm: 18,
  shelfCount: 1,
  front: defaultFront,
  legs: defaultLegs,
});

const mergeHandle = (baseHandle = defaultHandle, handle) => {
  if (handle === null) {
    return null;
  }

  return {
    ...baseHandle,
    ...(handle ?? {}),
  };
};

const mergeFront = (baseFront = defaultFront, front) => {
  if (front === null) {
    return null;
  }

  if (front === undefined && baseFront === null) {
    return null;
  }

  const resolvedBaseFront = baseFront ?? defaultFront;

  return {
    ...resolvedBaseFront,
    ...(front ?? {}),
    handle: mergeHandle(resolvedBaseFront.handle, front?.handle),
  };
};

const mergeLegs = (baseLegs = defaultLegs, legs) => {
  if (legs === null) {
    return null;
  }

  if (legs === undefined && baseLegs === null) {
    return null;
  }

  const resolvedBaseLegs = baseLegs ?? defaultLegs;

  return {
    ...resolvedBaseLegs,
    ...(legs ?? {}),
  };
};

export const mergeCabinetModel = (baseModel = defaultCabinetModel, overrides = {}) => ({
  ...baseModel,
  ...overrides,
  front: mergeFront(baseModel.front, overrides.front),
  legs: mergeLegs(baseModel.legs, overrides.legs),
});

export const createCabinetModel = (overrides = {}) => mergeCabinetModel(defaultCabinetModel, overrides);

const categoryCabinetModels = Object.freeze({
  base: createCabinetModel({
    shelfCount: 1,
    front: {
      type: "doubleDoor",
    },
    legs: {
      enabled: true,
    },
  }),
  drawer: createCabinetModel({
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
  tall: createCabinetModel({
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
  wall: createCabinetModel({
    shelfCount: 1,
    legs: null,
  }),
  corner: createCabinetModel({
    shelfCount: 2,
  }),
});

export const getDefaultCabinetModel = (category) => categoryCabinetModels[category] ?? defaultCabinetModel;

export const resolveCabinetModel = (category, overrides) =>
  mergeCabinetModel(getDefaultCabinetModel(category), overrides ?? {});
