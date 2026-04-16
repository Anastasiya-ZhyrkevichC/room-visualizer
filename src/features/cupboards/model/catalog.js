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

const compareStarterCabinetVariants = (firstVariant, secondVariant) =>
  firstVariant.width - secondVariant.width ||
  firstVariant.height - secondVariant.height ||
  firstVariant.depth - secondVariant.depth ||
  firstVariant.price - secondVariant.price ||
  firstVariant.id.localeCompare(secondVariant.id);

const getSortedUniqueValues = (values) =>
  [...new Set(values)].sort((firstValue, secondValue) => firstValue - secondValue);

const createStarterCabinetVariant = ({ id, width, height, depth, price }) => ({
  id: id ?? `${width}x${height}x${depth}`,
  width,
  height,
  depth,
  price,
  size: [convertMillimetersToMeters(width), convertMillimetersToMeters(height), convertMillimetersToMeters(depth)],
});

export const resolveStarterCabinetVariant = (cabinetDefinition, variantId = null) => {
  if (!cabinetDefinition?.variants?.length) {
    return null;
  }

  if (variantId) {
    const matchingVariant = cabinetDefinition.variants.find((variant) => variant.id === variantId);

    if (matchingVariant) {
      return matchingVariant;
    }
  }

  return cabinetDefinition.variants[0];
};

export const resolveDefaultStarterCabinetVariant = (cabinetDefinition) =>
  resolveStarterCabinetVariant(cabinetDefinition, cabinetDefinition?.defaultVariantId);

export const resolveStarterCabinetActiveVariant = (cabinetDefinition) =>
  resolveStarterCabinetVariant(
    cabinetDefinition,
    cabinetDefinition?.activeVariantId ?? cabinetDefinition?.defaultVariantId,
  );

export const resolveStarterCabinetDefinitionSnapshot = (cabinetDefinition, variantId = null) => {
  if (!cabinetDefinition) {
    return null;
  }

  const resolvedVariant = resolveStarterCabinetVariant(
    cabinetDefinition,
    variantId ?? cabinetDefinition.activeVariantId ?? cabinetDefinition.defaultVariantId,
  );

  if (!resolvedVariant) {
    return cabinetDefinition;
  }

  return {
    ...cabinetDefinition,
    activeVariantId: resolvedVariant.id,
    width: resolvedVariant.width,
    height: resolvedVariant.height,
    depth: resolvedVariant.depth,
    price: resolvedVariant.price,
    size: resolvedVariant.size,
  };
};

const createStarterCabinetDefinition = ({
  id,
  name,
  category,
  catalogFamily,
  model,
  variants,
  activeVariantId = null,
}) => {
  const normalizedVariants = variants
    .map((variant) => createStarterCabinetVariant(variant))
    .sort(compareStarterCabinetVariants);

  if (normalizedVariants.length === 0) {
    throw new Error(`Starter cabinet "${id}" must define at least one size variant.`);
  }

  const defaultVariant = normalizedVariants[0];
  const resolvedActiveVariant = normalizedVariants.find((variant) => variant.id === activeVariantId) ?? defaultVariant;
  const prices = normalizedVariants.map((variant) => variant.price);

  return resolveStarterCabinetDefinitionSnapshot({
    id,
    name,
    category,
    catalogFamily: resolveStarterCabinetFamilyId({ catalogFamily, category }),
    model: resolveCabinetModel(category, model),
    variants: normalizedVariants,
    availableWidths: getSortedUniqueValues(normalizedVariants.map((variant) => variant.width)),
    availableHeights: getSortedUniqueValues(normalizedVariants.map((variant) => variant.height)),
    defaultVariantId: defaultVariant?.id ?? null,
    activeVariantId: resolvedActiveVariant?.id ?? null,
    startingPrice: prices.length > 0 ? Math.min(...prices) : null,
    maxPrice: prices.length > 0 ? Math.max(...prices) : null,
  });
};

export const starterCabinetCatalog = [
  createStarterCabinetDefinition({
    id: "base-double-door",
    name: "Double-door base cabinet",
    category: "base",
    catalogFamily: "base-doors",
    activeVariantId: "600x720x560",
    variants: [
      {
        width: 300,
        height: 720,
        depth: 560,
        price: 160,
      },
      {
        width: 350,
        height: 720,
        depth: 560,
        price: 175,
      },
      {
        width: 400,
        height: 720,
        depth: 560,
        price: 190,
      },
      {
        width: 450,
        height: 720,
        depth: 560,
        price: 205,
      },
      {
        width: 600,
        height: 720,
        depth: 560,
        price: 240,
      },
    ],
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
  createStarterCabinetDefinition({
    id: "base-three-drawer",
    name: "Three-drawer base cabinet",
    category: "drawer",
    catalogFamily: "base-drawers",
    activeVariantId: "900x720x560",
    variants: [
      {
        width: 600,
        height: 720,
        depth: 560,
        price: 290,
      },
      {
        width: 800,
        height: 720,
        depth: 560,
        price: 350,
      },
      {
        width: 900,
        height: 720,
        depth: 560,
        price: 390,
      },
    ],
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
  createStarterCabinetDefinition({
    id: "tall-pantry",
    name: "Pantry tower",
    category: "tall",
    catalogFamily: "tall",
    activeVariantId: "600x2100x600",
    variants: [
      {
        width: 600,
        height: 2100,
        depth: 600,
        price: 680,
      },
      {
        width: 600,
        height: 2300,
        depth: 600,
        price: 760,
      },
    ],
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
