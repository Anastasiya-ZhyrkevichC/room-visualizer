import React, { useEffect, useRef, useState } from "react";

import { defaultOpenStarterCabinetGroupIds, starterCabinetCatalogGroups } from "../../cupboards/model/catalog";
import { useCupboards } from "../../cupboards/state/CupboardProvider";
import { formatModuleDimensions, formatPrototypePrice } from "../lib/roomFormatting";

const createInitialOpenGroups = () =>
  starterCabinetCatalogGroups.reduce((lookup, group) => {
    lookup[group.id] = defaultOpenStarterCabinetGroupIds.includes(group.id);
    return lookup;
  }, {});

const CabinetCatalogPanel = () => {
  const { cancelPlacementPreview, finishPlacementPreview, placementPreview, startPlacementPreview } = useCupboards();
  const [openGroups, setOpenGroups] = useState(createInitialOpenGroups);
  const placementCleanupRef = useRef(null);

  useEffect(() => {
    return () => {
      if (placementCleanupRef.current) {
        placementCleanupRef.current("cancel");
      }
    };
  }, []);

  const startPlacementSession = (catalogId) => {
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
    startPlacementPreview(catalogId);
  };

  const handleCatalogPointerDown = (catalogId, event) => {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    startPlacementSession(catalogId);
  };

  const handleCatalogAddClick = (catalogId) => {
    startPlacementSession(catalogId);
  };

  const handleGroupToggle = (groupId) => {
    setOpenGroups((currentOpenGroups) => ({
      ...currentOpenGroups,
      [groupId]: !currentOpenGroups[groupId],
    }));
  };

  return (
    <section className="panel-card panel-card--secondary">
      <div className="panel-card__header">
        <p className="panel-card__eyebrow">Kitchen Catalog</p>
        <h2 className="panel-card__title">Browse by cabinet family</h2>
      </div>
      <p className="panel-card__copy">
        Expand a cabinet family, then drag a module into the room or click Add and place it on the back, left, or right
        wall.
      </p>

      <div className="catalog-tree">
        {starterCabinetCatalogGroups.map((group) => {
          const isOpen = openGroups[group.id];
          const groupCountLabel = `${group.cabinets.length} ${group.cabinets.length === 1 ? "module" : "modules"}`;
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
                      const dimensionLabel = formatModuleDimensions(cabinet);
                      const priceLabel = formatPrototypePrice(cabinet.price);

                      return (
                        <article
                          className={`catalog-row${
                            placementPreview?.catalogId === cabinet.id ? " catalog-row--dragging" : ""
                          }`}
                          key={cabinet.id}
                          onPointerDown={(event) => handleCatalogPointerDown(cabinet.id, event)}
                        >
                          <div className="catalog-row__content">
                            <strong className="catalog-row__title" title={cabinet.name}>
                              {cabinet.name}
                            </strong>
                            <div className="catalog-row__details">
                              <span className="catalog-row__dimensions" title={dimensionLabel}>
                                {dimensionLabel}
                              </span>
                              <span className="catalog-row__separator" aria-hidden="true">
                                •
                              </span>
                              <strong className="catalog-row__price">{priceLabel}</strong>
                            </div>
                          </div>
                          <div className="catalog-row__actions">
                            <button
                              type="button"
                              className="catalog-row__add"
                              onPointerDown={(event) => {
                                event.stopPropagation();
                              }}
                              onClick={() => handleCatalogAddClick(cabinet.id)}
                            >
                              Add
                            </button>
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <p className="catalog-group__empty">No starter modules in this family yet.</p>
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
