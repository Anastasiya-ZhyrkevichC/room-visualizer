import { convertMillimetersToMeters } from "../../../lib/units";

const createStarterCabinet = ({ id, name, category, width, height, depth, price }) => ({
  id,
  name,
  category,
  width,
  height,
  depth,
  price,
  size: [
    convertMillimetersToMeters(width),
    convertMillimetersToMeters(height),
    convertMillimetersToMeters(depth),
  ],
});

export const starterCabinetCatalog = [
  createStarterCabinet({
    id: "base-600",
    name: "Double-door base 600",
    category: "base",
    width: 600,
    height: 720,
    depth: 560,
    price: 240,
  }),
  createStarterCabinet({
    id: "drawer-900",
    name: "Three-drawer base 900",
    category: "drawer",
    width: 900,
    height: 720,
    depth: 560,
    price: 390,
  }),
  createStarterCabinet({
    id: "tall-600",
    name: "Pantry tower 600",
    category: "tall",
    width: 600,
    height: 2100,
    depth: 600,
    price: 680,
  }),
];

export const defaultStarterCabinetId = starterCabinetCatalog[0].id;

const starterCabinetLookup = starterCabinetCatalog.reduce((lookup, cabinet) => {
  lookup[cabinet.id] = cabinet;
  return lookup;
}, {});

export const getStarterCabinet = (catalogId) => starterCabinetLookup[catalogId] ?? starterCabinetCatalog[0];
