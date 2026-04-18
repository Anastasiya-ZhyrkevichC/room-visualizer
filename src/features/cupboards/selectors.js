import { STARTER_CABINET_PRICE_CURRENCY } from "./model/catalog";
import { deriveTableTopRuns } from "./model/tableTop";

const comparePricingInstanceIds = (firstItem, secondItem) => {
  if (typeof firstItem.instanceId === "number" && typeof secondItem.instanceId === "number") {
    return firstItem.instanceId - secondItem.instanceId;
  }

  return String(firstItem.instanceId).localeCompare(String(secondItem.instanceId), undefined, {
    numeric: true,
  });
};

const formatPricingDimensions = (cupboard) => {
  const dimensions = [cupboard?.width, cupboard?.height, cupboard?.depth];

  return dimensions.every((dimension) => Number.isFinite(dimension))
    ? `${dimensions.map((dimension) => Math.round(dimension)).join(" x ")} mm`
    : "";
};

export const selectSelectedCupboard = (state) =>
  state.cupboards.find((cupboard) => cupboard.id === state.selectedCupboardId) ?? null;

export const selectTableTopRuns = (state) => deriveTableTopRuns(state?.cupboards ?? []);

export const selectPricingLineItems = (state) =>
  (state?.cupboards ?? [])
    .map((cupboard) => ({
      cupboardId: cupboard.id,
      instanceId: cupboard.id,
      catalogId: cupboard.catalogId ?? null,
      activeVariantId: cupboard.activeVariantId ?? null,
      displayName: cupboard.name ?? "Unnamed cabinet",
      dimensionsLabel: formatPricingDimensions(cupboard),
      price: cupboard?.isUnavailable ? null : Number.isFinite(cupboard.price) ? cupboard.price : 0,
      referencePrice: cupboard?.isUnavailable && Number.isFinite(cupboard.price) ? cupboard.price : null,
      currency: cupboard.currency ?? STARTER_CABINET_PRICE_CURRENCY,
      isUnavailable: Boolean(cupboard?.isUnavailable),
      unavailableReason: cupboard?.unavailableReason ?? null,
    }))
    .sort(comparePricingInstanceIds);

export const selectPricingSummary = (state) => {
  const lineItems = selectPricingLineItems(state);
  const resolvedLineItems = lineItems.filter((lineItem) => !lineItem.isUnavailable && Number.isFinite(lineItem.price));
  const unavailableCount = lineItems.filter((lineItem) => lineItem.isUnavailable).length;
  const selectedLineItemId = lineItems.some((lineItem) => lineItem.cupboardId === state?.selectedCupboardId)
    ? state.selectedCupboardId
    : null;
  const currencySet = new Set(lineItems.map((lineItem) => lineItem.currency).filter(Boolean));

  return {
    lineItems,
    totalPrice: resolvedLineItems.reduce((runningTotal, lineItem) => runningTotal + lineItem.price, 0),
    objectCount: lineItems.length,
    isEmpty: lineItems.length === 0,
    currency: lineItems[0]?.currency ?? STARTER_CABINET_PRICE_CURRENCY,
    hasMixedCurrencies: currencySet.size > 1,
    resolvedObjectCount: resolvedLineItems.length,
    unavailableCount,
    hasUnavailableItems: unavailableCount > 0,
    isResolved: unavailableCount === 0,
    selectedLineItemId,
  };
};
