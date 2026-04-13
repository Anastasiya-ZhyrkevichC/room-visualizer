import React, { useEffect, useRef } from "react";

import { starterCabinetCatalog } from "../../cupboards/model/catalog";
import { useCupboards } from "../../cupboards/state/CupboardProvider";
import { formatModuleCategory, formatModuleDimensions, formatPrototypePrice } from "../lib/roomFormatting";

const CabinetCatalogPanel = () => {
  const { cancelPlacementPreview, finishPlacementPreview, placementPreview, startPlacementPreview } = useCupboards();
  const dragCleanupRef = useRef(null);

  useEffect(() => {
    return () => {
      if (dragCleanupRef.current) {
        dragCleanupRef.current("cancel");
      }
    };
  }, []);

  const handleCatalogPointerDown = (catalogId, event) => {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();

    if (dragCleanupRef.current) {
      dragCleanupRef.current("cancel");
    }

    const finalizeDrag = (mode = "cancel") => {
      if (mode === "finish") {
        finishPlacementPreview();
      } else {
        cancelPlacementPreview();
      }

      if (dragCleanupRef.current) {
        dragCleanupRef.current = null;
      }

      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
      window.removeEventListener("keydown", handleKeyDown);
    };

    const handlePointerUp = () => finalizeDrag("finish");
    const handlePointerCancel = () => finalizeDrag("cancel");
    const handleKeyDown = (keyboardEvent) => {
      if (keyboardEvent.key === "Escape") {
        finalizeDrag("cancel");
      }
    };

    dragCleanupRef.current = finalizeDrag;
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);
    window.addEventListener("keydown", handleKeyDown);
    startPlacementPreview(catalogId);
  };

  return (
    <section className="panel-card panel-card--secondary">
      <div className="panel-card__header">
        <p className="panel-card__eyebrow">Kitchen Catalog</p>
        <h2 className="panel-card__title">Drag a module</h2>
      </div>
      <p className="panel-card__copy">
        Drag a module card into the room and release on the back, left, or right wall to place it.
      </p>

      <div className="catalog-list">
        {starterCabinetCatalog.map((cabinet) => (
          <article
            className={`catalog-card${placementPreview?.catalogId === cabinet.id ? " catalog-card--dragging" : ""}`}
            key={cabinet.id}
            onPointerDown={(event) => handleCatalogPointerDown(cabinet.id, event)}
          >
            <div className="catalog-card__content">
              <div className="catalog-card__meta">
                <span className="catalog-card__category">{formatModuleCategory(cabinet.category)}</span>
                <strong className="catalog-card__price">{formatPrototypePrice(cabinet.price)}</strong>
              </div>
              <strong className="catalog-card__title">{cabinet.name}</strong>
              <span className="catalog-card__size">{formatModuleDimensions(cabinet)}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default CabinetCatalogPanel;
