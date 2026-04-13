import React from "react";

import { useCupboards } from "../../cupboards/state/CupboardProvider";
import RoomCanvas from "../../room/components/RoomCanvas";

const PlannerStage = () => {
  const { isPlacementActive, placementPreview, selectedCupboard } = useCupboards();
  const selectionBadge = isPlacementActive
    ? `Previewing ${placementPreview.name}`
    : selectedCupboard
      ? `${selectedCupboard.name} selected`
      : "Click a cabinet to select it";
  const placementHint = placementPreview?.isValid
    ? "Release to place this cabinet on the back wall."
    : "Move over the back wall to position the preview. Release elsewhere or press Escape to cancel.";

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
