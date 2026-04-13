import { convertMillimetersToMeters } from "../../../lib/units";
import { resolveCabinetModel } from "./renderModel";

const createStarterCabinet = ({ id, name, category, width, height, depth, price, model }) => ({
  id,
  name,
  category,
  width,
  height,
  depth,
  price,
  model: resolveCabinetModel(category, model),
  size: [
    convertMillimetersToMeters(width),
    convertMillimetersToMeters(height),
    convertMillimetersToMeters(depth),
  ],
});

export const starterCabinetUsageGroups = [
  {
    id: "base",
    label: "Base cabinets",
  },
  {
    id: "drawer",
    label: "Drawer units",
  },
  {
    id: "wall",
    label: "Wall cabinets",
  },
  {
    id: "tall",
    label: "Tall units",
  },
  {
    id: "corner",
    label: "Corner cabinets",
  },
];

export const starterCabinetCatalog = [
  createStarterCabinet({
    id: "base-600",
    name: "Double-door base 600",
    category: "base",
    width: 600,
    height: 720,
    depth: 560,
    price: 240,
    model: {
      shelfCount: 1,
      front: {
        type: "doubleDoor",
        handle: {
          lengthMm: 176,
        },
      },
      legs: {
        heightMm: 110,
      },
    },
  }),
  createStarterCabinet({
    id: "drawer-900",
    name: "Three-drawer base 900",
    category: "drawer",
    width: 900,
    height: 720,
    depth: 560,
    price: 390,
    model: {
      shelfCount: 0,
      front: {
        type: "drawers",
        drawerCount: 3,
        handle: {
          orientation: "horizontal",
          lengthMm: 224,
        },
      },
      legs: {
        heightMm: 110,
      },
    },
  }),
  createStarterCabinet({
    id: "tall-600",
    name: "Pantry tower 600",
    category: "tall",
    width: 600,
    height: 2100,
    depth: 600,
    price: 680,
    model: {
      shelfCount: 4,
      legs: null,
      front: {
        type: "doubleDoor",
        handle: {
          lengthMm: 256,
        },
      },
    },
  }),
];

export const defaultStarterCabinetId = starterCabinetCatalog[0].id;

const starterCabinetsByCategory = starterCabinetCatalog.reduce((lookup, cabinet) => {
  if (!lookup[cabinet.category]) {
    lookup[cabinet.category] = [];
  }

  lookup[cabinet.category].push(cabinet);
  return lookup;
}, {});

export const starterCabinetCatalogGroups = starterCabinetUsageGroups.map((group) => ({
  ...group,
  cabinets: starterCabinetsByCategory[group.id] ?? [],
}));

export const defaultOpenStarterCabinetGroupIds = starterCabinetCatalogGroups
  .filter((group) => group.cabinets.length > 0)
  .map((group) => group.id);

const starterCabinetLookup = starterCabinetCatalog.reduce((lookup, cabinet) => {
  lookup[cabinet.id] = cabinet;
  return lookup;
}, {});

export const getStarterCabinet = (catalogId) => starterCabinetLookup[catalogId] ?? starterCabinetCatalog[0];
