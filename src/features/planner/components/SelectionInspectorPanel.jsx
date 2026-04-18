import React from "react";
import { Button } from "@mui/material";

import { getCupboardFootprint, getCupboardRotationDegrees } from "../../cupboards/model/geometry";
import { useCupboards } from "../../cupboards/state/CupboardProvider";
import { convertMetersToMillimeters } from "../../../lib/units";
import {
  HEIGHT_OPTIONS_REFERENCE_NOTE,
  formatMillimeterTuple,
  formatModuleDimensions,
  formatModuleFamily,
  formatModuleHeightOptions,
  formatModuleWidthOptions,
  formatPrototypePrice,
  formatSelectionResizeHint,
  formatSelectionPosition,
} from "../lib/roomFormatting";

const SelectionInspectorPanel = () => {
  const { selectedCupboard, clearSelection, rotateSelectedCupboard, deleteSelectedCupboard } = useCupboards();
  const isUnavailable = Boolean(selectedCupboard?.isUnavailable);

  const selectedCupboardFootprint = selectedCupboard
    ? getCupboardFootprint(selectedCupboard.size, selectedCupboard.rotation)
    : null;
  const selectedRotationDegrees = selectedCupboard ? getCupboardRotationDegrees(selectedCupboard.rotation) : null;
  const selectedFootprintDimensionsMm = selectedCupboardFootprint
    ? [
        convertMetersToMillimeters(selectedCupboardFootprint.width),
        convertMetersToMillimeters(selectedCupboardFootprint.depth),
      ]
    : null;
  const supportedWidthsLabel = selectedCupboard ? formatModuleWidthOptions(selectedCupboard) : "";
  const supportedHeightsLabel = selectedCupboard ? formatModuleHeightOptions(selectedCupboard) : "";

  return (
    <section className="panel-card">
      <div className="panel-card__header">
        <p className="panel-card__eyebrow">Cabinet Inspector</p>
        <h2 className="panel-card__title">Selected cabinet</h2>
      </div>

      {selectedCupboard ? (
        <div className="selection-panel">
          <div className="selection-panel__hero">
            <span className="selection-panel__tag">Selected in scene</span>
            <strong className="selection-panel__name">{selectedCupboard.name}</strong>
            <p className="selection-panel__meta">
              {formatModuleFamily(selectedCupboard)} ·{" "}
              {isUnavailable
                ? "Live price unavailable"
                : formatPrototypePrice(selectedCupboard.price, selectedCupboard.currency)}
            </p>
            <p className="selection-panel__copy">
              {isUnavailable
                ? "This cabinet came from an imported project, but its source module is no longer available in the current catalog. Replace it from the catalog or delete it to restore a clean live total."
                : `${formatSelectionResizeHint()} ${HEIGHT_OPTIONS_REFERENCE_NOTE}. Drag the cabinet body along its current wall.`}
            </p>
          </div>

          {isUnavailable ? (
            <div className="selection-panel__warning">
              <strong>Imported snapshot reference</strong>
              <p>
                The current catalog cannot reprice this cabinet. The saved export-time reference price was{" "}
                {formatPrototypePrice(selectedCupboard.price, selectedCupboard.currency)}.
              </p>
            </div>
          ) : null}

          <div className="selection-details">
            <div className="selection-details__item">
              <span className="selection-details__label">Cabinet family</span>
              <strong className="selection-details__value">{formatModuleFamily(selectedCupboard)}</strong>
            </div>
            <div className="selection-details__item">
              <span className="selection-details__label">Active cabinet size</span>
              <strong className="selection-details__value">{formatModuleDimensions(selectedCupboard)}</strong>
            </div>
            <div className="selection-details__item">
              <span className="selection-details__label">Supported widths</span>
              <strong className="selection-details__value">{supportedWidthsLabel}</strong>
            </div>
            <div className="selection-details__item">
              <span className="selection-details__label">Supported heights</span>
              <strong className="selection-details__value">{supportedHeightsLabel}</strong>
            </div>
            <div className="selection-details__item">
              <span className="selection-details__label">Height editing</span>
              <strong className="selection-details__value">{HEIGHT_OPTIONS_REFERENCE_NOTE}</strong>
            </div>
            <div className="selection-details__item">
              <span className="selection-details__label">{isUnavailable ? "Live price" : "Prototype price"}</span>
              <strong className="selection-details__value">
                {isUnavailable
                  ? "Unavailable"
                  : formatPrototypePrice(selectedCupboard.price, selectedCupboard.currency)}
              </strong>
            </div>
            {isUnavailable ? (
              <div className="selection-details__item">
                <span className="selection-details__label">Exported reference price</span>
                <strong className="selection-details__value">
                  {formatPrototypePrice(selectedCupboard.price, selectedCupboard.currency)}
                </strong>
              </div>
            ) : null}
            <div className="selection-details__item">
              <span className="selection-details__label">Current footprint</span>
              <strong className="selection-details__value">
                {selectedFootprintDimensionsMm ? formatMillimeterTuple(selectedFootprintDimensionsMm) : "N/A"}
              </strong>
            </div>
            <div className="selection-details__item">
              <span className="selection-details__label">Rotation</span>
              <strong className="selection-details__value">{selectedRotationDegrees}°</strong>
            </div>
            <div className="selection-details__item">
              <span className="selection-details__label">Scene position</span>
              <strong className="selection-details__value">{formatSelectionPosition(selectedCupboard.position)}</strong>
            </div>
          </div>

          <div className="selection-actions">
            <Button
              type="button"
              variant="contained"
              onClick={rotateSelectedCupboard}
              className="planner-button planner-button--primary"
            >
              Rotate 90°
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={deleteSelectedCupboard}
              className="planner-button planner-button--danger"
            >
              Delete
            </Button>
          </div>

          <Button type="button" variant="text" onClick={clearSelection} className="selection-panel__clear">
            Clear selection
          </Button>
        </div>
      ) : (
        <div className="empty-state">
          <strong className="empty-state__title">Nothing selected yet</strong>
          <p className="empty-state__copy">
            Click a cabinet in the 3D room to inspect it here, then drag its side handles to resize it, drag the cabinet
            body along its wall, rotate it 90 degrees, or delete it from the layout.
          </p>
        </div>
      )}
    </section>
  );
};

export default SelectionInspectorPanel;
