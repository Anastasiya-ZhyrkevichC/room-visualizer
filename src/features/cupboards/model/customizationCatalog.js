export const starterCarcassCatalog = [
  {
    id: "carcass-standard-white",
    label: "Standard white",
    swatch: "#f3eee5",
    compatibleCategories: ["base", "drawer", "wall", "tall", "corner"],
    pricing: {
      mode: "flat",
      surcharge: 0,
    },
    appearance: {
      bodyColor: "#d7cab6",
      interiorColor: "#f7f0e5",
      legColor: "#7a6656",
    },
  },
  {
    id: "carcass-oak-smoke",
    label: "Oak smoke",
    swatch: "#b18b6a",
    compatibleCategories: ["base", "drawer", "wall", "tall", "corner"],
    pricing: {
      mode: "flat",
      surcharge: 38,
    },
    appearance: {
      bodyColor: "#b89472",
      interiorColor: "#d8bea3",
      legColor: "#5f4b3e",
    },
  },
];

export const starterFacadeCatalog = [
  {
    id: "facade-white-matte",
    label: "White matte",
    swatch: "#f4efe8",
    materialFamily: "painted",
    compatibleCategories: ["base", "drawer", "wall", "tall", "corner"],
    pricing: {
      mode: "front-area-band",
      bands: [
        { maxAreaSqM: 0.35, surcharge: 0 },
        { maxAreaSqM: 0.65, surcharge: 0 },
        { maxAreaSqM: Number.POSITIVE_INFINITY, surcharge: 0 },
      ],
    },
    appearance: {
      frontColor: "#f1e7da",
    },
  },
  {
    id: "facade-oak-matte",
    label: "Oak matte",
    swatch: "#c89a69",
    materialFamily: "oak",
    compatibleCategories: ["base", "drawer", "wall", "tall", "corner"],
    pricing: {
      mode: "front-area-band",
      bands: [
        { maxAreaSqM: 0.35, surcharge: 40 },
        { maxAreaSqM: 0.65, surcharge: 65 },
        { maxAreaSqM: Number.POSITIVE_INFINITY, surcharge: 90 },
      ],
    },
    appearance: {
      frontColor: "#d4af86",
    },
  },
  {
    id: "facade-sage-matte",
    label: "Sage matte",
    swatch: "#aeb6a1",
    materialFamily: "painted",
    compatibleCategories: ["base", "drawer", "wall", "tall", "corner"],
    pricing: {
      mode: "front-area-band",
      bands: [
        { maxAreaSqM: 0.35, surcharge: 28 },
        { maxAreaSqM: 0.65, surcharge: 48 },
        { maxAreaSqM: Number.POSITIVE_INFINITY, surcharge: 66 },
      ],
    },
    appearance: {
      frontColor: "#b8c1ac",
    },
  },
];

export const starterHandleCatalog = [
  {
    id: "handle-brushed-steel",
    label: "Brushed steel",
    swatch: "#8b8d93",
    compatibleFrontTypes: ["doubleDoor", "drawers", "liftUp"],
    pricing: {
      mode: "per-handle-unit",
      surcharge: 12,
    },
    appearance: {
      handleColor: "#83868d",
    },
    dimensions: {
      defaultLengthMm: 192,
    },
  },
  {
    id: "handle-black-rail",
    label: "Black rail",
    swatch: "#383838",
    compatibleFrontTypes: ["doubleDoor", "drawers", "liftUp"],
    pricing: {
      mode: "per-handle-unit",
      surcharge: 18,
    },
    appearance: {
      handleColor: "#373534",
    },
    dimensions: {
      defaultLengthMm: 224,
    },
  },
];

export const starterAccessoryCatalog = [
  {
    id: "accessory-cutlery-insert",
    label: "Cutlery insert",
    compatibleCategories: ["drawer"],
    compatibleWidths: [600, 800, 900],
    pricing: {
      mode: "flat",
      surcharge: 25,
    },
  },
  {
    id: "accessory-spice-insert",
    label: "Spice insert",
    compatibleCategories: ["drawer"],
    compatibleWidths: [600, 800, 900],
    pricing: {
      mode: "flat",
      surcharge: 32,
    },
  },
  {
    id: "accessory-waste-bin",
    label: "Waste bin pull-out",
    compatibleCategories: ["base"],
    compatibleWidths: [400, 450, 600],
    pricing: {
      mode: "flat",
      surcharge: 95,
    },
  },
  {
    id: "accessory-pantry-organizer",
    label: "Pantry organiser",
    compatibleCategories: ["tall"],
    compatibleWidths: [600],
    pricing: {
      mode: "flat",
      surcharge: 140,
    },
  },
  {
    id: "accessory-wall-rail",
    label: "Under-shelf rail",
    compatibleCategories: ["wall"],
    compatibleWidths: [300, 350, 400, 450, 600],
    pricing: {
      mode: "flat",
      surcharge: 28,
    },
  },
];

export const starterAccessoryPresetCatalog = [
  {
    id: "preset-minimal",
    label: "Minimal",
    defaultAccessoryIdsByCategory: {
      base: [],
      drawer: [],
      wall: [],
      tall: [],
      corner: [],
    },
  },
  {
    id: "preset-standard",
    label: "Standard",
    defaultAccessoryIdsByCategory: {
      base: [],
      drawer: ["accessory-cutlery-insert"],
      wall: [],
      tall: [],
      corner: [],
    },
  },
  {
    id: "preset-storage-plus",
    label: "Storage Plus",
    defaultAccessoryIdsByCategory: {
      base: ["accessory-waste-bin"],
      drawer: ["accessory-cutlery-insert", "accessory-spice-insert"],
      wall: ["accessory-wall-rail"],
      tall: ["accessory-pantry-organizer"],
      corner: [],
    },
  },
];

export const defaultStarterProjectCustomisation = Object.freeze({
  carcassId: starterCarcassCatalog[0].id,
  facadeId: starterFacadeCatalog[0].id,
  handleId: starterHandleCatalog[0].id,
  accessoryPresetId: starterAccessoryPresetCatalog[1].id,
});

const createLookup = (items) =>
  items.reduce((lookup, item) => {
    lookup[item.id] = item;
    return lookup;
  }, {});

const carcassLookup = createLookup(starterCarcassCatalog);
const facadeLookup = createLookup(starterFacadeCatalog);
const handleLookup = createLookup(starterHandleCatalog);
const accessoryLookup = createLookup(starterAccessoryCatalog);
const accessoryPresetLookup = createLookup(starterAccessoryPresetCatalog);

export const findCarcassOption = (optionId) => carcassLookup[optionId] ?? null;

export const findFacadeOption = (optionId) => facadeLookup[optionId] ?? null;

export const findHandleOption = (optionId) => handleLookup[optionId] ?? null;

export const findAccessoryOption = (optionId) => accessoryLookup[optionId] ?? null;

export const findAccessoryPresetOption = (optionId) => accessoryPresetLookup[optionId] ?? null;
