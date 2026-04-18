import React from "react";

import { useCupboards } from "../../cupboards/state/CupboardProvider";
import { getPlannerStageViewModel } from "../lib/stageMessaging";
import RoomCanvas from "../../room/components/RoomCanvas";

const PlannerStage = () => {
  const {
    activeMove,
    activeResize,
    isMoveActive,
    isPlacementActive,
    isResizeActive,
    placementPreview,
    selectedCupboard,
  } = useCupboards();
  const { isStageInvalid, selectionBadge, stageHint } = getPlannerStageViewModel({
    activeMove,
    activeResize,
    isMoveActive,
    isPlacementActive,
    isResizeActive,
    placementPreview,
    selectedCupboard,
  });

  return (
    <main className="planner-stage">
      <div className="planner-stage__header">
        <div>
          <p className="planner-stage__eyebrow">Main Workspace</p>
          <h2 className="planner-stage__title">3D room preview</h2>
        </div>
        <div
          className={`planner-stage__badge${selectedCupboard || isPlacementActive ? " planner-stage__badge--active" : ""}${isStageInvalid ? " planner-stage__badge--invalid" : ""}`}
        >
          {selectionBadge}
        </div>
      </div>

      <div className="planner-stage__canvas">
        {stageHint ? (
          <div className={`planner-stage__hint${isStageInvalid ? " planner-stage__hint--invalid" : ""}`}>
            {stageHint}
          </div>
        ) : null}
        <RoomCanvas />
      </div>
    </main>
  );
};

export default PlannerStage;
