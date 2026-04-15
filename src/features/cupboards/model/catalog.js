import { convertMillimetersToMeters } from "../../../lib/units";
import { resolveCabinetModel } from "./renderModel";

export const starterCabinetCatalogFamilies = [
  {
    id: "base-doors",
    label: "Base cabinets with doors",
  },
  {
    id: "base-drawers",
    label: "Base cabinets with drawers",
  },
  {
    id: "wall-doors",
    label: "Wall cabinets with doors",
  },
  {
    id: "wall-lift-up",
    label: "Lift-up wall cabinets",
  },
  {
    id: "tall",
    label: "Tall cabinets",
  },
  {
    id: "corner",
    label: "Corner cabinets",
  },
];

const legacyCategoryFamilyMap = Object.freeze({
  base: "base-doors",
  drawer: "base-drawers",
  wall: "wall-doors",
  tall: "tall",
  corner: "corner",
});

const starterCabinetFamilyLookup = starterCabinetCatalogFamilies.reduce((lookup, family) => {
  lookup[family.id] = family;
  return lookup;
}, {});

export const resolveStarterCabinetFamilyId = ({ catalogFamily, category } = {}) =>
  catalogFamily ?? legacyCategoryFamilyMap[category] ?? category ?? null;

export const getStarterCabinetFamilyLabel = (cabinet) => {
  const familyId = resolveStarterCabinetFamilyId(cabinet);

  return starterCabinetFamilyLookup[familyId]?.label ?? cabinet?.category ?? familyId ?? "";
};

const createStarterCabinet = ({ id, name, category, catalogFamily, width, height, depth, price, model }) => ({
  id,
  name,
  category,
  catalogFamily: resolveStarterCabinetFamilyId({ catalogFamily, category }),
  width,
  height,
  depth,
  price,
  model: resolveCabinetModel(category, model),
  size: [convertMillimetersToMeters(width), convertMillimetersToMeters(height), convertMillimetersToMeters(depth)],
});

export const starterCabinetCatalog = [
  createStarterCabinet({
    id: "base-600",
    name: "Double-door base 600",
    category: "base",
    catalogFamily: "base-doors",
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
    catalogFamily: "base-drawers",
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
    catalogFamily: "tall",
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

const starterCabinetsByFamily = starterCabinetCatalog.reduce((lookup, cabinet) => {
  const familyId = resolveStarterCabinetFamilyId(cabinet);

  if (!lookup[familyId]) {
    lookup[familyId] = [];
  }

  lookup[familyId].push(cabinet);
  return lookup;
}, {});

export const starterCabinetCatalogGroups = starterCabinetCatalogFamilies.map((family) => ({
  ...family,
  cabinets: starterCabinetsByFamily[family.id] ?? [],
}));

export const defaultOpenStarterCabinetGroupIds = starterCabinetCatalogGroups
  .filter((group) => group.cabinets.length > 0)
  .map((group) => group.id);

const starterCabinetLookup = starterCabinetCatalog.reduce((lookup, cabinet) => {
  lookup[cabinet.id] = cabinet;
  return lookup;
}, {});

export const getStarterCabinet = (catalogId) => starterCabinetLookup[catalogId] ?? starterCabinetCatalog[0];
