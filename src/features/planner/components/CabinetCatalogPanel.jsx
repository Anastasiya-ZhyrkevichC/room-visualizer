import React, { useEffect, useRef } from "react";

import { starterCabinetCatalog } from "../../cupboards/model/catalog";
import { useCupboards } from "../../cupboards/state/CupboardProvider";
import { formatMillimeterTuple } from "../lib/roomFormatting";

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
        <p className="panel-card__eyebrow">Starter Catalog</p>
        <h2 className="panel-card__title">Drag a cabinet</h2>
      </div>
      <p className="panel-card__copy">Drag a cabinet card into the room and release on the back wall to place it.</p>

      <div className="catalog-list">
        {starterCabinetCatalog.map((cabinet) => (
          <article
            className={`catalog-card${placementPreview?.catalogId === cabinet.id ? " catalog-card--dragging" : ""}`}
            key={cabinet.id}
            onPointerDown={(event) => handleCatalogPointerDown(cabinet.id, event)}
          >
            <div className="catalog-card__content">
              <strong className="catalog-card__title">{cabinet.name}</strong>
              <span className="catalog-card__size">{formatMillimeterTuple(cabinet.dimensionsMm)}</span>
              <p className="catalog-card__copy">{cabinet.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default CabinetCatalogPanel;
