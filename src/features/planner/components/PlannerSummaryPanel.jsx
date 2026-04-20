import React, { useMemo, useRef } from "react";

import { useCupboards } from "../../cupboards/state/CupboardProvider";
import {
  formatPrototypePrice,
  formatRoomDimensions,
  formatTableTopDimensions,
  formatTableTopLabel,
} from "../lib/roomFormatting";

const EMPTY_PRICING_SUMMARY = {
  lineItems: [],
  totalPrice: 0,
  objectCount: 0,
  isEmpty: true,
  currency: "USD",
  unresolvedItemCount: 0,
  unavailableCount: 0,
  hasUnavailableItems: false,
  isResolved: true,
  selectedLineItemId: null,
};

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const formatSnapshotTimestamp = (value) => {
  if (!value) {
    return "Unknown save time";
  }

  const parsedValue = new Date(value);

  return Number.isNaN(parsedValue.getTime()) ? "Unknown save time" : dateTimeFormatter.format(parsedValue);
};

const formatPriceDelta = (value, currency) => {
  if (!Number.isFinite(value) || value === 0) {
    return "";
  }

  return `${value > 0 ? "+" : "-"}${formatPrototypePrice(Math.abs(value), currency)}`;
};

const getReferenceItemStatusLabel = (item) => {
  if (item.status === "unavailable") {
    return "Unavailable in current catalog. Remove this cabinet or add a current catalog alternative to restore a clean live total.";
  }

  if (item.status === "removed") {
    return "Removed from the current live plan after the snapshot was saved.";
  }

  if (item.status === "changed") {
    const deltaLabel = formatPriceDelta(item.deltaPrice, item.liveCurrency ?? item.currency);
    const livePriceLabel = Number.isFinite(item.livePrice)
      ? formatPrototypePrice(item.livePrice, item.liveCurrency ?? item.currency)
      : "Unavailable";

    return deltaLabel ? `Live now ${livePriceLabel} (${deltaLabel}).` : `Live now ${livePriceLabel}.`;
  }

  return "Matches the current live catalog pricing.";
};

const getComparisonSummary = ({ comparison, pricingReference, pricingSummary }) => {
  if (!comparison) {
    return null;
  }

  if (comparison.unavailableCount > 0 || pricingSummary.hasUnavailableItems) {
    return {
      tone: "warning",
      title: "Live repricing is unresolved",
      body: `${pricingSummary.unavailableCount} cabinet${
        pricingSummary.unavailableCount === 1 ? "" : "s"
      } cannot be repriced from the current catalog. Remove them or add current catalog alternatives to restore a full live total.`,
    };
  }

  if (comparison.hasDifferences) {
    const snapshotTotalLabel = formatPrototypePrice(
      pricingReference.snapshot.totalPrice,
      pricingReference.snapshot.currency ?? pricingSummary.currency,
    );
    const liveTotalLabel = formatPrototypePrice(pricingSummary.totalPrice, pricingSummary.currency);

    return {
      tone: "warning",
      title: "Live pricing differs from the saved snapshot",
      body: `Current live total ${liveTotalLabel} vs saved snapshot ${snapshotTotalLabel}. Review the item-level changes below before quoting from this plan.`,
    };
  }

  return {
    tone: "success",
    title: "Live pricing matches the saved snapshot",
    body:
      pricingReference.source === "import"
        ? "The imported project resolves cleanly against the current catalog with no detected price drift."
        : "The latest exported JSON preserves the same live pricing shown in the planner.",
  };
};

const PlannerSummaryPanel = ({
  appliedRoomDimensions,
  onExportProject = () => {},
  onImportProject = () => {},
  pricingReference = null,
  projectTransferFeedback = null,
}) => {
  const { pricingSummary = EMPTY_PRICING_SUMMARY, selectCupboard = () => {}, tableTopRuns = [] } = useCupboards();
  const fileInputRef = useRef(null);
  const {
    currency,
    hasUnavailableItems,
    isEmpty,
    isResolved,
    lineItems,
    objectCount,
    selectedLineItemId,
    totalPrice,
    unavailableCount,
  } = pricingSummary;
  const totalPriceLabel = formatPrototypePrice(totalPrice, currency);
  const cabinetCountLabel = `${objectCount} ${objectCount === 1 ? "cabinet" : "cabinets"}`;
  const tableTopCountLabel = `${tableTopRuns.length} ${tableTopRuns.length === 1 ? "piece" : "pieces"}`;
  const comparisonSummary = useMemo(
    () =>
      pricingReference?.comparison
        ? getComparisonSummary({
            comparison: pricingReference.comparison,
            pricingReference,
            pricingSummary,
          })
        : null,
    [pricingReference, pricingSummary],
  );

  const handleImportButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFileChange = async (event) => {
    const [file] = event.target.files ?? [];

    if (file) {
      await onImportProject(file);
    }

    event.target.value = "";
  };

  return (
    <section className="panel-card panel-card--secondary">
      <div className="panel-card__header">
        <p className="panel-card__eyebrow">Live Pricing</p>
        <h2 className="panel-card__title">Cabinet total</h2>
      </div>
      <p className="panel-card__copy">
        Current cabinet pricing only. Delivery, installation, and tax are excluded from this running total.
      </p>

      <div className="project-transfer">
        <div className="project-transfer__actions">
          <button type="button" className="project-transfer__button" onClick={onExportProject}>
            Export JSON
          </button>
          <button
            type="button"
            className="project-transfer__button project-transfer__button--secondary"
            onClick={handleImportButtonClick}
          >
            Import JSON
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.room-project.json,application/json"
          className="project-transfer__input"
          onChange={handleImportFileChange}
        />
        {projectTransferFeedback ? (
          <div
            className={`project-transfer__feedback project-transfer__feedback--${projectTransferFeedback.tone ?? "info"}`}
          >
            {projectTransferFeedback.message}
          </div>
        ) : null}
      </div>

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

      <div className="table-top-summary" aria-label="Derived table tops">
        <div className="table-top-summary__header">
          <div>
            <p className="table-top-summary__eyebrow">Derived surfaces</p>
            <h3 className="table-top-summary__title">Table tops</h3>
          </div>
          <span className="table-top-summary__count">{tableTopCountLabel}</span>
        </div>

        {tableTopRuns.length === 0 ? (
          <div className="empty-state empty-state--compact table-top-summary__empty">
            <strong className="empty-state__title">No table tops yet</strong>
            <p className="empty-state__copy">
              Drag a base or drawer cabinet into the room to generate a derived tabletop run in the planner summary.
            </p>
          </div>
        ) : (
          <div className="table-top-summary__list">
            {tableTopRuns.map((tableTopRun) => (
              <div key={tableTopRun.id} className="table-top-summary__item">
                <div className="table-top-summary__item-copy">
                  <span className="table-top-summary__item-label">{formatTableTopLabel(tableTopRun)}</span>
                  <strong className="table-top-summary__item-meta">
                    Supports {tableTopRun.cupboardIds.length} cabinet{tableTopRun.cupboardIds.length === 1 ? "" : "s"}
                  </strong>
                </div>
                <strong className="table-top-summary__item-dimensions">{formatTableTopDimensions(tableTopRun)}</strong>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pricing-summary">
        {isEmpty ? (
          <div className="empty-state empty-state--compact pricing-summary__empty">
            <strong className="empty-state__title">No cabinets priced yet</strong>
            <p className="empty-state__copy">
              Drag a cabinet from the catalog into the room to create a live line item. The current cabinet total stays
              at {totalPriceLabel}.
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
                  className={`pricing-summary__item${isSelected ? " pricing-summary__item--selected" : ""}${
                    lineItem.isUnavailable ? " pricing-summary__item--unavailable" : ""
                  }`}
                  onClick={() => selectCupboard(lineItem.cupboardId)}
                  aria-pressed={isSelected}
                >
                  <div className="pricing-summary__item-copy">
                    <span className="pricing-summary__instance">Cabinet {lineItem.instanceId}</span>
                    <strong className="pricing-summary__name">{lineItem.displayName}</strong>
                    {lineItem.dimensionsLabel ? (
                      <span className="pricing-summary__dimensions">{lineItem.dimensionsLabel}</span>
                    ) : null}
                    {lineItem.isUnavailable ? (
                      <span className="pricing-summary__status">Live price unavailable in current catalog</span>
                    ) : null}
                  </div>
                  <strong className="pricing-summary__price">
                    {lineItem.isUnavailable ? "Unavailable" : formatPrototypePrice(lineItem.price, lineItem.currency)}
                  </strong>
                </button>
              );
            })}
          </div>
        )}

        <div className="pricing-summary__footer" aria-label="Total cabinet price">
          <div>
            <span className="pricing-summary__footer-label">{isResolved ? "Total price" : "Partial live total"}</span>
            <p className="pricing-summary__footer-note">
              {hasUnavailableItems
                ? `${unavailableCount} unavailable cabinet${unavailableCount === 1 ? "" : "s"} excluded from the live total.`
                : "Live cabinet total only."}
            </p>
          </div>
          <strong className="pricing-summary__footer-value">{totalPriceLabel}</strong>
        </div>
      </div>

      {pricingReference?.snapshot ? (
        <div className="pricing-reference">
          <div className="panel-card__header pricing-reference__header">
            <div>
              <p className="panel-card__eyebrow">
                {pricingReference.source === "import" ? "Imported Snapshot" : "Latest Export"}
              </p>
              <h3 className="panel-card__title pricing-reference__title">Saved pricing reference</h3>
            </div>
            <div className="pricing-reference__meta">
              <strong>{formatSnapshotTimestamp(pricingReference.savedAt ?? pricingReference.snapshot.savedAt)}</strong>
              {pricingReference.fileName ? <span>{pricingReference.fileName}</span> : null}
            </div>
          </div>

          <p className="panel-card__copy pricing-reference__copy">
            {pricingReference.source === "import"
              ? "These prices came from the imported JSON file and remain historical reference data while the planner recalculates against the current catalog."
              : "These prices were written into the most recent exported JSON file and stay fixed until you export again."}
          </p>

          {comparisonSummary ? (
            <div className={`pricing-reference__alert pricing-reference__alert--${comparisonSummary.tone}`}>
              <strong>{comparisonSummary.title}</strong>
              <p>{comparisonSummary.body}</p>
            </div>
          ) : null}

          <div className="pricing-reference__list" aria-label="Saved pricing snapshot">
            {(pricingReference.comparison?.items ?? pricingReference.snapshot.lineItems ?? []).map((item) => (
              <div
                key={item.instanceId}
                className={`pricing-reference__item pricing-reference__item--${item.status ?? "matched"}`}
              >
                <div className="pricing-reference__item-copy">
                  <span className="pricing-reference__instance">Cabinet {item.instanceId}</span>
                  <strong className="pricing-reference__name">{item.displayName}</strong>
                  {item.dimensionsLabel ? (
                    <span className="pricing-reference__dimensions">{item.dimensionsLabel}</span>
                  ) : null}
                  <span className="pricing-reference__status">{getReferenceItemStatusLabel(item)}</span>
                </div>
                <strong className="pricing-reference__price">
                  {Number.isFinite(item.price) ? formatPrototypePrice(item.price, item.currency) : "Unavailable"}
                </strong>
              </div>
            ))}
          </div>

          {pricingReference.comparison?.liveOnlyCount ? (
            <p className="pricing-reference__note">
              {pricingReference.comparison.liveOnlyCount} cabinet
              {pricingReference.comparison.liveOnlyCount === 1 ? "" : "s"} were added after this snapshot and only
              appear in the live total above.
            </p>
          ) : null}

          <div className="pricing-reference__footer">
            <div>
              <span className="pricing-reference__footer-label">Saved snapshot total</span>
              <p className="pricing-reference__footer-note">
                {pricingReference.source === "import"
                  ? "Reference total from the imported project file."
                  : "Reference total stored in the latest exported file."}
              </p>
            </div>
            <strong className="pricing-reference__footer-value">
              {formatPrototypePrice(
                pricingReference.snapshot.totalPrice,
                pricingReference.snapshot.currency ?? pricingSummary.currency,
              )}
            </strong>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default PlannerSummaryPanel;
