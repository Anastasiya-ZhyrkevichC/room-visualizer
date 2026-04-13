import { convertMillimetersToMeters } from "../../../lib/units";

export const starterCabinetCatalog = [
  {
    id: "base-600",
    name: "Base cabinet 600",
    description: "Compact two-door base unit for the starter layout.",
    dimensionsMm: [600, 720, 560],
    size: [
      convertMillimetersToMeters(600),
      convertMillimetersToMeters(720),
      convertMillimetersToMeters(560),
    ],
  },
  {
    id: "drawer-900",
    name: "Drawer base 900",
    description: "Wide drawer unit that makes rotation visibly obvious in the scene.",
    dimensionsMm: [900, 720, 560],
    size: [
      convertMillimetersToMeters(900),
      convertMillimetersToMeters(720),
      convertMillimetersToMeters(560),
    ],
  },
  {
    id: "tall-600",
    name: "Tall pantry 600",
    description: "Full-height pantry block that anchors the run of cabinets.",
    dimensionsMm: [600, 2100, 600],
    size: [
      convertMillimetersToMeters(600),
      convertMillimetersToMeters(2100),
      convertMillimetersToMeters(600),
    ],
  },
];

export const defaultStarterCabinetId = starterCabinetCatalog[0].id;

const starterCabinetLookup = starterCabinetCatalog.reduce((lookup, cabinet) => {
  lookup[cabinet.id] = cabinet;
  return lookup;
}, {});

export const getStarterCabinet = (catalogId) => starterCabinetLookup[catalogId] ?? starterCabinetCatalog[0];
