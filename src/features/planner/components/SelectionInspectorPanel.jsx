import React from "react";
import { Button } from "@mui/material";

import { getCupboardFootprint, getCupboardRotationDegrees } from "../../cupboards/model/geometry";
import { useCupboards } from "../../cupboards/state/CupboardProvider";
import { convertMetersToMillimeters } from "../../../lib/units";
import { formatMillimeterTuple, formatSelectionPosition } from "../lib/roomFormatting";

const SelectionInspectorPanel = () => {
  const { selectedCupboard, clearSelection, rotateSelectedCupboard, deleteSelectedCupboard } = useCupboards();

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
            <p className="selection-panel__copy">{selectedCupboard.description}</p>
            <p className="selection-panel__copy">Drag this cabinet in the 3D room to move it along its current wall.</p>
          </div>

          <div className="selection-details">
            <div className="selection-details__item">
              <span className="selection-details__label">Cabinet size</span>
              <strong className="selection-details__value">
                {formatMillimeterTuple(selectedCupboard.dimensionsMm)}
              </strong>
            </div>
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
            Click a cabinet in the 3D room to inspect it here, then drag it along its wall, rotate it 90 degrees, or
            delete it from the layout.
          </p>
        </div>
      )}
    </section>
  );
};

export default SelectionInspectorPanel;
