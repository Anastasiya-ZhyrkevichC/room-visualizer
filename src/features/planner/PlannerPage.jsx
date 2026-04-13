import React from "react";

import { CupboardProvider } from "../cupboards/state/CupboardProvider";
import { RoomSceneProvider } from "../room/context/RoomSceneContext";
import CabinetCatalogPanel from "./components/CabinetCatalogPanel";
import PlannerHeader from "./components/PlannerHeader";
import PlannerStage from "./components/PlannerStage";
import PlannerSummaryPanel from "./components/PlannerSummaryPanel";
import RoomSetupPanel from "./components/RoomSetupPanel";
import SelectionInspectorPanel from "./components/SelectionInspectorPanel";
import { useRoomDimensionsForm } from "./hooks/useRoomDimensionsForm";

const PlannerLayout = ({ roomDimensionsForm }) => {
  return (
    <div className="planner-page">
      <PlannerHeader appliedRoomDimensions={roomDimensionsForm.appliedRoomDimensions} />

      <div className="planner-layout">
        <aside className="planner-panel planner-panel--left">
          <RoomSetupPanel
            draftRoomDimensions={roomDimensionsForm.draftRoomDimensions}
            validationErrors={roomDimensionsForm.validationErrors}
            roomFeedback={roomDimensionsForm.roomFeedback}
            hasDraftChanges={roomDimensionsForm.hasDraftChanges}
            isDefaultRoomApplied={roomDimensionsForm.isDefaultRoomApplied}
            onRoomChange={roomDimensionsForm.handleRoomChange}
            onApplyRoom={roomDimensionsForm.handleApplyRoom}
            onResetRoom={roomDimensionsForm.handleResetRoom}
          />
          <CabinetCatalogPanel />
        </aside>

        <PlannerStage />

        <aside className="planner-panel planner-panel--right">
          <SelectionInspectorPanel />
          <PlannerSummaryPanel appliedRoomDimensions={roomDimensionsForm.appliedRoomDimensions} />
        </aside>
      </div>
    </div>
  );
};

const PlannerPage = () => {
  const roomDimensionsForm = useRoomDimensionsForm();

  return (
    <RoomSceneProvider dimensions={roomDimensionsForm.sceneDimensions}>
      <CupboardProvider>
        <PlannerLayout roomDimensionsForm={roomDimensionsForm} />
      </CupboardProvider>
    </RoomSceneProvider>
  );
};

export default PlannerPage;
