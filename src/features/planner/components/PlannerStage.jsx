import React from "react";

import { LEFT_WALL_ID, RIGHT_WALL_ID, getPlacementValidationReasonLabel } from "../../cupboards/model/placement";
import { useCupboards } from "../../cupboards/state/CupboardProvider";
import RoomCanvas from "../../room/components/RoomCanvas";

const getWallLabel = (wall) =>
  wall === LEFT_WALL_ID ? "left wall" : wall === RIGHT_WALL_ID ? "right wall" : "back wall";

const PlannerStage = () => {
  const { activeMove, isMoveActive, isPlacementActive, placementPreview, selectedCupboard } = useCupboards();
  const placementValidation = placementPreview?.validation;
  const moveValidation = activeMove?.validation;
  const selectionBadge = isPlacementActive
    ? `Previewing ${placementPreview.name}`
    : isMoveActive && selectedCupboard
      ? `Moving ${selectedCupboard.name}`
      : selectedCupboard
        ? `${selectedCupboard.name} selected`
        : "Click a cabinet to select it";
  const placementWallLabel = getWallLabel(placementPreview?.wall);
  const placementReasonLabel = getPlacementValidationReasonLabel(placementValidation?.reason);
  const placementHint = placementValidation?.isValid
    ? `Release to place this cabinet on the ${placementWallLabel}.`
    : placementReasonLabel
      ? `${placementReasonLabel}. Move over the back, left, or right wall to find a valid position, or press Escape to cancel.`
      : "Move over the back, left, or right wall to position the preview. Release elsewhere or press Escape to cancel.";
  const moveWallLabel = getWallLabel(selectedCupboard?.wall);
  const moveReasonLabel = getPlacementValidationReasonLabel(moveValidation?.reason);
  const moveHint =
    isMoveActive && selectedCupboard
      ? moveValidation?.isValid
        ? `Drag along the ${moveWallLabel} and release to keep the cabinet in its new position.`
        : moveReasonLabel
          ? `${moveReasonLabel}. Drag back to a valid position on the ${moveWallLabel}, or press Escape to restore the previous position.`
          : `Move back onto the ${moveWallLabel} before releasing, or press Escape to restore the previous position.`
      : selectedCupboard
        ? `Drag the selected cabinet in the scene to reposition it along the ${moveWallLabel}.`
        : null;
  const stageHint = isPlacementActive ? placementHint : moveHint;

  return (
    <main className="planner-stage">
      <div className="planner-stage__header">
        <div>
          <p className="planner-stage__eyebrow">Main Workspace</p>
          <h2 className="planner-stage__title">3D room preview</h2>
        </div>
        <div
          className={`planner-stage__badge${selectedCupboard || isPlacementActive ? " planner-stage__badge--active" : ""}`}
        >
          {selectionBadge}
        </div>
      </div>

      <div className="planner-stage__canvas">
        {stageHint ? <div className="planner-stage__hint">{stageHint}</div> : null}
        <RoomCanvas />
      </div>
    </main>
  );
};

export default PlannerStage;
