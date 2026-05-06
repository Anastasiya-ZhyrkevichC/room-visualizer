import { convertMillimetersToMeters } from "../../../lib/units";
import { resolveCabinetModel } from "./renderModel";
import {
  hasCupboardCustomisationOverrides,
  resolveEffectiveCustomisation,
} from "./customization";

const getResolvedBodyPrice = (cupboard) => {
  if (Number.isFinite(cupboard?.price)) {
    return cupboard.price;
  }

  return 0;
};

const getCarcassHeightMeters = (cupboard) => {
  const heightMeters = Array.isArray(cupboard?.size) && Number.isFinite(cupboard.size[1]) ? cupboard.size[1] : 0;
  const resolvedModel = resolveCabinetModel(cupboard?.category, cupboard?.model);
  const legsEnabled = resolvedModel.legs?.enabled === true;
  const legHeightMeters = legsEnabled ? convertMillimetersToMeters(resolvedModel.legs?.heightMm ?? 0) : 0;

  return Math.max(heightMeters - legHeightMeters, 0);
};

export const resolveCabinetFrontMetrics = (cupboard) => {
  const resolvedModel = resolveCabinetModel(cupboard?.category, cupboard?.model);
  const widthMeters = Array.isArray(cupboard?.size) && Number.isFinite(cupboard.size[0]) ? cupboard.size[0] : 0;
  const frontHeightMeters = getCarcassHeightMeters(cupboard);
  const hasFacade = resolvedModel.front?.hasFacade !== false;
  const frontType = resolvedModel.front?.type ?? null;
  const frontCount =
    frontType === "drawers"
      ? Math.max(resolvedModel.front?.drawerCount ?? 0, 0)
      : hasFacade
        ? Math.max(resolvedModel.front?.doorCount ?? 2, 1)
        : 0;

  return {
    frontType,
    hasFacade,
    totalVisibleFrontAreaSqM: hasFacade ? widthMeters * frontHeightMeters : 0,
    handleCount: resolvedModel.front?.handle ? frontCount : 0,
    frontCount,
  };
};

const resolveBandSurcharge = (pricing, areaSqM) => {
  if (!pricing || pricing.mode !== "front-area-band" || !Array.isArray(pricing.bands)) {
    return Number.isFinite(pricing?.surcharge) ? pricing.surcharge : 0;
  }

  const matchingBand =
    pricing.bands.find((band) => Number.isFinite(band?.maxAreaSqM) && areaSqM <= band.maxAreaSqM) ??
    pricing.bands[pricing.bands.length - 1];

  return Number.isFinite(matchingBand?.surcharge) ? matchingBand.surcharge : 0;
};

const resolveFlatSurcharge = (pricing) => (Number.isFinite(pricing?.surcharge) ? pricing.surcharge : 0);

const resolveHandleSurcharge = (pricing, handleCount) =>
  pricing?.mode === "per-handle-unit"
    ? resolveFlatSurcharge(pricing) * handleCount
    : resolveFlatSurcharge(pricing);

const sumNumbers = (values) => values.reduce((runningTotal, value) => runningTotal + (Number.isFinite(value) ? value : 0), 0);

export const calculateCupboardPriceBreakdown = (cupboard, projectCustomisation) => {
  const resolvedCustomisation = resolveEffectiveCustomisation(cupboard, projectCustomisation);
  const frontMetrics = resolveCabinetFrontMetrics(cupboard);
  const bodyPrice = getResolvedBodyPrice(cupboard);
  const carcassPrice = resolveFlatSurcharge(resolvedCustomisation.options.carcass?.pricing);
  const facadePrice = frontMetrics.hasFacade
    ? resolveBandSurcharge(
        resolvedCustomisation.options.facade?.pricing,
        frontMetrics.totalVisibleFrontAreaSqM,
      )
    : 0;
  const handlePrice = resolveHandleSurcharge(
    resolvedCustomisation.options.handle?.pricing,
    frontMetrics.handleCount,
  );
  const accessoriesPrice = sumNumbers(
    resolvedCustomisation.options.accessories.map((option) => resolveFlatSurcharge(option?.pricing)),
  );
  const totalPrice = sumNumbers([bodyPrice, carcassPrice, facadePrice, handlePrice, accessoriesPrice]);

  return {
    cupboardId: cupboard?.id ?? null,
    displayName: cupboard?.name ?? "Unnamed cabinet",
    bodyPrice,
    carcassPrice,
    facadePrice,
    handlePrice,
    accessoriesPrice,
    totalPrice,
    price: totalPrice,
    currency: cupboard?.currency ?? "USD",
    metrics: frontMetrics,
    resolvedCustomisation,
  };
};

const buildConfigurationChips = (breakdown) => {
  const { options, sources, effectiveCustomisation } = breakdown.resolvedCustomisation;
  const accessoryLabel =
    effectiveCustomisation.accessoryIds.length === 0
      ? "Accessories: None"
      : effectiveCustomisation.accessoryIds.length === 1
        ? `Accessory: ${options.accessories[0]?.label ?? "Accessory"}`
        : `Accessories: ${effectiveCustomisation.accessoryIds.length}`;

  return [
    options.carcass ? `Carcass: ${options.carcass.label}` : null,
    options.facade ? `Facade: ${options.facade.label}` : null,
    options.handle ? `Handle: ${options.handle.label}` : null,
    options.accessoryPreset ? `Preset: ${options.accessoryPreset.label}` : null,
    accessoryLabel,
    sources.carcass === "override" ||
    sources.facade === "override" ||
    sources.handle === "override" ||
    sources.accessoryPreset === "override" ||
    sources.accessories === "override"
      ? "Customized"
      : null,
  ].filter(Boolean);
};

export const calculatePricingLineItem = (cupboard, projectCustomisation) => {
  const breakdown = calculateCupboardPriceBreakdown(cupboard, projectCustomisation);

  return {
    cupboardId: cupboard.id,
    instanceId: cupboard.id,
    catalogId: cupboard.catalogId ?? null,
    activeVariantId: cupboard.activeVariantId ?? null,
    displayName: cupboard.name ?? "Unnamed cabinet",
    bodyPrice: breakdown.bodyPrice,
    carcassPrice: breakdown.carcassPrice,
    facadePrice: breakdown.facadePrice,
    handlePrice: breakdown.handlePrice,
    accessoriesPrice: breakdown.accessoriesPrice,
    totalPrice: breakdown.totalPrice,
    price: breakdown.totalPrice,
    currency: cupboard.currency ?? "USD",
    isUnavailable: false,
    referencePrice: null,
    unavailableReason: null,
    isCustomised: hasCupboardCustomisationOverrides(cupboard),
    customisationChips: buildConfigurationChips(breakdown),
    effectiveCustomisation: breakdown.resolvedCustomisation.effectiveCustomisation,
    customisationSources: breakdown.resolvedCustomisation.sources,
  };
};

export const calculatePricingSummary = (cupboards = [], projectCustomisation) => {
  const lineItems = cupboards.map((cupboard) => calculatePricingLineItem(cupboard, projectCustomisation));

  return {
    lineItems,
    totalPrice: sumNumbers(lineItems.map((lineItem) => lineItem.totalPrice)),
    objectCount: lineItems.length,
    isEmpty: lineItems.length === 0,
    currency: lineItems[0]?.currency ?? "USD",
  };
};
