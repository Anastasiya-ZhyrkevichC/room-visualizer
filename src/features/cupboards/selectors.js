import { STARTER_CABINET_PRICE_CURRENCY } from "./model/catalog";

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

export const selectPricingLineItems = (state) =>
  (state?.cupboards ?? [])
    .map((cupboard) => ({
      cupboardId: cupboard.id,
      instanceId: cupboard.id,
      catalogId: cupboard.catalogId ?? null,
      displayName: cupboard.name ?? "Unnamed cabinet",
      dimensionsLabel: formatPricingDimensions(cupboard),
      price: Number.isFinite(cupboard.price) ? cupboard.price : 0,
      currency: cupboard.currency ?? STARTER_CABINET_PRICE_CURRENCY,
    }))
    .sort(comparePricingInstanceIds);

export const selectPricingSummary = (state) => {
  const lineItems = selectPricingLineItems(state);
  const selectedLineItemId = lineItems.some((lineItem) => lineItem.cupboardId === state?.selectedCupboardId)
    ? state.selectedCupboardId
    : null;
  const currencySet = new Set(lineItems.map((lineItem) => lineItem.currency).filter(Boolean));

  return {
    lineItems,
    totalPrice: lineItems.reduce((runningTotal, lineItem) => runningTotal + lineItem.price, 0),
    objectCount: lineItems.length,
    isEmpty: lineItems.length === 0,
    currency: lineItems[0]?.currency ?? STARTER_CABINET_PRICE_CURRENCY,
    hasMixedCurrencies: currencySet.size > 1,
    selectedLineItemId,
  };
};
