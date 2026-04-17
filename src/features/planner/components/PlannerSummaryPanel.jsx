import React from "react";

import { useCupboards } from "../../cupboards/state/CupboardProvider";
import { formatPrototypePrice, formatRoomDimensions } from "../lib/roomFormatting";

const EMPTY_PRICING_SUMMARY = {
  lineItems: [],
  totalPrice: 0,
  objectCount: 0,
  isEmpty: true,
  currency: "USD",
  selectedLineItemId: null,
};

const PlannerSummaryPanel = ({ appliedRoomDimensions }) => {
  const { pricingSummary = EMPTY_PRICING_SUMMARY, selectCupboard = () => {} } = useCupboards();
  const { currency, isEmpty, lineItems, objectCount, selectedLineItemId, totalPrice } = pricingSummary;
  const totalPriceLabel = formatPrototypePrice(totalPrice, currency);
  const cabinetCountLabel = `${objectCount} ${objectCount === 1 ? "cabinet" : "cabinets"}`;

  return (
    <section className="panel-card panel-card--secondary">
      <div className="panel-card__header">
        <p className="panel-card__eyebrow">Live Pricing</p>
        <h2 className="panel-card__title">Cabinet total</h2>
      </div>
      <p className="panel-card__copy">
        Current cabinet pricing only. Delivery, installation, and tax are excluded from this running total.
      </p>

      <div className="summary-list pricing-summary__stats">
        <div className="summary-list__item">
          <span>Room shell</span>
          <strong>{formatRoomDimensions(appliedRoomDimensions)}</strong>
        </div>
        <div className="summary-list__item">
          <span>Priced cabinets</span>
          <strong>{cabinetCountLabel}</strong>
        </div>
      </div>

      <div className="pricing-summary">
        {isEmpty ? (
          <div className="empty-state empty-state--compact pricing-summary__empty">
            <strong className="empty-state__title">No cabinets priced yet</strong>
            <p className="empty-state__copy">
              Add a cabinet from the catalog to create a live line item. The current cabinet total stays at{" "}
              {totalPriceLabel}.
            </p>
          </div>
        ) : (
          <div className="pricing-summary__list" aria-label="Live cabinet pricing">
            {lineItems.map((lineItem) => {
              const isSelected = selectedLineItemId === lineItem.cupboardId;

              return (
                <button
                  key={lineItem.instanceId}
                  type="button"
                  className={`pricing-summary__item${isSelected ? " pricing-summary__item--selected" : ""}`}
                  onClick={() => selectCupboard(lineItem.cupboardId)}
                  aria-pressed={isSelected}
                >
                  <div className="pricing-summary__item-copy">
                    <span className="pricing-summary__instance">Cabinet {lineItem.instanceId}</span>
                    <strong className="pricing-summary__name">{lineItem.displayName}</strong>
                    {lineItem.dimensionsLabel ? (
                      <span className="pricing-summary__dimensions">{lineItem.dimensionsLabel}</span>
                    ) : null}
                  </div>
                  <strong className="pricing-summary__price">
                    {formatPrototypePrice(lineItem.price, lineItem.currency)}
                  </strong>
                </button>
              );
            })}
          </div>
        )}

        <div className="pricing-summary__footer" aria-label="Total cabinet price">
          <div>
            <span className="pricing-summary__footer-label">Total price</span>
            <p className="pricing-summary__footer-note">Live cabinet total only.</p>
          </div>
          <strong className="pricing-summary__footer-value">{totalPriceLabel}</strong>
        </div>
      </div>
    </section>
  );
};

export default PlannerSummaryPanel;
