import React from "react";

import { useCupboards } from "../../cupboards/state/CupboardProvider";
import RoomCanvas from "../../room/components/RoomCanvas";

const PlannerStage = () => {
  const { selectedCupboard } = useCupboards();
  const selectionBadge = selectedCupboard ? `${selectedCupboard.name} selected` : "Click a cabinet to select it";

  return (
    <main className="planner-stage">
      <div className="planner-stage__header">
        <div>
          <p className="planner-stage__eyebrow">Main Workspace</p>
          <h2 className="planner-stage__title">3D room preview</h2>
        </div>
        <div className={`planner-stage__badge${selectedCupboard ? " planner-stage__badge--active" : ""}`}>
          {selectionBadge}
        </div>
      </div>

      <div className="planner-stage__canvas">
        <RoomCanvas />
      </div>
    </main>
  );
};

export default PlannerStage;
