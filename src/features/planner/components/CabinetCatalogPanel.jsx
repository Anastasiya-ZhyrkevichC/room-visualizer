import React, { useEffect, useRef, useState } from "react";

import {
  defaultOpenStarterCabinetGroupIds,
  getStarterCabinetVariantsForHeight,
  resolveStarterCabinetDefaultVariantForHeight,
  resolveDefaultStarterCabinetVariant,
  starterCabinetCatalogGroups,
} from "../../cupboards/model/catalog";
import { useCupboards } from "../../cupboards/state/CupboardProvider";
import {
  formatCatalogModulePrice,
  formatMillimeterOptions,
  formatModuleDepth,
  formatPrototypePrice,
} from "../lib/roomFormatting";
import CatalogCabinetPreview from "./CatalogCabinetPreview";

const createInitialOpenGroups = () =>
  starterCabinetCatalogGroups.reduce((lookup, group) => {
    lookup[group.id] = defaultOpenStarterCabinetGroupIds.includes(group.id);
    return lookup;
  }, {});

const createInitialSelectedHeights = () =>
  starterCabinetCatalogGroups.reduce((lookup, group) => {
    group.cabinets.forEach((cabinet) => {
      lookup[cabinet.id] = resolveDefaultStarterCabinetVariant(cabinet)?.height ?? cabinet.height ?? null;
    });

    return lookup;
  }, {});

const CabinetCatalogPanel = () => {
  const { cancelPlacementPreview, finishPlacementPreview, placementPreview, startPlacementPreview } = useCupboards();
  const [openGroups, setOpenGroups] = useState(createInitialOpenGroups);
  const [selectedHeights, setSelectedHeights] = useState(createInitialSelectedHeights);
  const placementCleanupRef = useRef(null);

  useEffect(() => {
    return () => {
      if (placementCleanupRef.current) {
        placementCleanupRef.current("cancel");
      }
    };
  }, []);

  const startPlacementSession = (catalogId, variantId = null) => {
    if (placementCleanupRef.current) {
      placementCleanupRef.current("cancel");
    }

    const finalizePlacement = (mode = "cancel") => {
      if (mode === "finish") {
        finishPlacementPreview();
      } else {
        cancelPlacementPreview();
      }

      if (placementCleanupRef.current === finalizePlacement) {
        placementCleanupRef.current = null;
      }

      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
      window.removeEventListener("keydown", handleKeyDown);
    };

    const handlePointerUp = (event) => {
      if (event.button !== 0) {
        return;
      }

      finalizePlacement("finish");
    };

    const handlePointerCancel = () => {
      finalizePlacement("cancel");
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        finalizePlacement("cancel");
      }
    };

    placementCleanupRef.current = finalizePlacement;
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);
    window.addEventListener("keydown", handleKeyDown);
    startPlacementPreview(catalogId, { variantId });
  };

  const handleCatalogPointerDown = (catalogId, variantId, event) => {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    startPlacementSession(catalogId, variantId);
  };

  const handleGroupToggle = (groupId) => {
    setOpenGroups((currentOpenGroups) => ({
      ...currentOpenGroups,
      [groupId]: !currentOpenGroups[groupId],
    }));
  };

  const handleHeightChange = (catalogId, nextHeight) => {
    setSelectedHeights((currentSelectedHeights) => ({
      ...currentSelectedHeights,
      [catalogId]: nextHeight,
    }));
  };

  return (
    <section className="panel-card panel-card--secondary">
      <div className="panel-card__header">
        <p className="panel-card__eyebrow">Kitchen Catalog</p>
        <h2 className="panel-card__title">Browse by cabinet family</h2>
      </div>
      <p className="panel-card__copy">
        Expand a cabinet family, choose a height when variants exist, then drag a cabinet into the room. Each row places
        the smallest size for the chosen height first, and you can resize it after selecting it in the scene.
      </p>

      <div className="catalog-tree">
        {starterCabinetCatalogGroups.map((group) => {
          const isOpen = openGroups[group.id];
          const groupCountLabel = `${group.cabinets.length} ${group.cabinets.length === 1 ? "cabinet" : "cabinets"}`;
          const groupPanelId = `catalog-group-${group.id}`;

          return (
            <section className={`catalog-group${isOpen ? " catalog-group--open" : ""}`} key={group.id}>
              <button
                type="button"
                className="catalog-group__toggle"
                onClick={() => handleGroupToggle(group.id)}
                aria-expanded={isOpen}
                aria-controls={groupPanelId}
              >
                <strong className="catalog-group__title" title={group.label}>
                  {group.label}
                </strong>
                <span className="catalog-group__count" aria-label={groupCountLabel} title={groupCountLabel}>
                  {group.cabinets.length}
                </span>
                <span
                  className={`catalog-group__icon${isOpen ? " catalog-group__icon--open" : ""}`}
                  aria-hidden="true"
                />
              </button>

              {isOpen ? (
                <div className="catalog-list" id={groupPanelId}>
                  {group.cabinets.length > 0 ? (
                    group.cabinets.map((cabinet) => {
                      const fallbackVariant = resolveDefaultStarterCabinetVariant(cabinet) ?? cabinet;
                      const selectedHeight = selectedHeights[cabinet.id] ?? fallbackVariant.height ?? null;
                      const heightVariants = getStarterCabinetVariantsForHeight(cabinet, selectedHeight);
                      const defaultVariant =
                        resolveStarterCabinetDefaultVariantForHeight(cabinet, selectedHeight) ?? fallbackVariant;
                      const selectedHeightLabel = formatMillimeterOptions([selectedHeight]);
                      const depthLabel = formatModuleDepth(defaultVariant);
                      const priceLabel = formatCatalogModulePrice(cabinet);
                      const hasHeightOptions = (cabinet.availableHeights?.length ?? 0) > 1;

                      return (
                        <article
                          className={`catalog-row${
                            placementPreview?.catalogId === cabinet.id ? " catalog-row--dragging" : ""
                          }`}
                          key={cabinet.id}
                          onPointerDown={(event) => handleCatalogPointerDown(cabinet.id, defaultVariant.id, event)}
                        >
                          <div className="catalog-row__preview">
                            <CatalogCabinetPreview
                              size={defaultVariant.size}
                              category={cabinet.category}
                              model={cabinet.model}
                            />
                          </div>
                          <div className="catalog-row__content">
                            <div className="catalog-row__headline">
                              <div className="catalog-row__title-stack">
                                <strong className="catalog-row__title" title={cabinet.name}>
                                  {cabinet.name}
                                </strong>
                                <div className="catalog-row__meta">
                                  <span className="catalog-row__price">{priceLabel}</span>
                                  <span className="catalog-row__separator" aria-hidden="true">
                                    •
                                  </span>
                                  <span className="catalog-row__depth">Depth {depthLabel}</span>
                                </div>
                              </div>
                            </div>
                            <div className="catalog-row__controls">
                              {hasHeightOptions ? (
                                <label
                                  className="catalog-row__control"
                                  onPointerDown={(event) => {
                                    event.stopPropagation();
                                  }}
                                >
                                  <span className="catalog-row__control-label">Height</span>
                                  <select
                                    className="catalog-row__select"
                                    value={String(selectedHeight)}
                                    onChange={(event) => handleHeightChange(cabinet.id, Number(event.target.value))}
                                    onPointerDown={(event) => {
                                      event.stopPropagation();
                                    }}
                                  >
                                    {cabinet.availableHeights.map((height) => (
                                      <option key={height} value={height}>
                                        {formatMillimeterOptions([height])}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                              ) : (
                                <div className="catalog-row__control catalog-row__control--static">
                                  <span className="catalog-row__control-label">Height</span>
                                  <strong className="catalog-row__control-value">{selectedHeightLabel}</strong>
                                </div>
                              )}
                            </div>
                            <div className="catalog-row__table-wrap">
                              <table
                                className="catalog-row__variant-table"
                                aria-label={`${cabinet.name} widths and prices`}
                              >
                                <thead>
                                  <tr>
                                    <th scope="col">Width</th>
                                    <th scope="col">Price</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {heightVariants.map((variant) => {
                                    return (
                                      <tr key={variant.id}>
                                        <td>
                                          <span className="catalog-row__variant-width">
                                            {formatMillimeterOptions([variant.width])}
                                          </span>
                                        </td>
                                        <td>{formatPrototypePrice(variant.price, cabinet.currency)}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <p className="catalog-group__empty">No starter cabinets in this family yet.</p>
                  )}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
    </section>
  );
};

export default CabinetCatalogPanel;
