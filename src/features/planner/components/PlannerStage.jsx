import React from "react";

import { LEFT_WALL_ID, RIGHT_WALL_ID } from "../../cupboards/model/placement";
import { useCupboards } from "../../cupboards/state/CupboardProvider";
import RoomCanvas from "../../room/components/RoomCanvas";

const PlannerStage = () => {
  const { isPlacementActive, placementPreview, selectedCupboard } = useCupboards();
  const selectionBadge = isPlacementActive
    ? `Previewing ${placementPreview.name}`
    : selectedCupboard
      ? `${selectedCupboard.name} selected`
      : "Click a cabinet to select it";
  const placementWallLabel =
    placementPreview?.wall === LEFT_WALL_ID
      ? "left wall"
      : placementPreview?.wall === RIGHT_WALL_ID
        ? "right wall"
        : "back wall";
  const placementHint = placementPreview?.isValid
    ? `Release to place this cabinet on the ${placementWallLabel}.`
    : "Move over the back, left, or right wall to position the preview. Release elsewhere or press Escape to cancel.";

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
        {isPlacementActive ? <div className="planner-stage__hint">{placementHint}</div> : null}
        <RoomCanvas />
      </div>
    </main>
  );
};

export default PlannerStage;
