import React, { useCallback, useMemo, useState } from "react";

import { CupboardProvider, useCupboards } from "../cupboards/state/CupboardProvider";
import { RoomSceneProvider } from "../room/context/RoomSceneContext";
import CabinetCatalogPanel from "./components/CabinetCatalogPanel";
import PlannerHeader from "./components/PlannerHeader";
import PlannerStage from "./components/PlannerStage";
import PlannerSummaryPanel from "./components/PlannerSummaryPanel";
import RoomSetupPanel from "./components/RoomSetupPanel";
import SelectionInspectorPanel from "./components/SelectionInspectorPanel";
import { useRoomDimensionsForm } from "./hooks/useRoomDimensionsForm";
import {
  createProjectDocument,
  createProjectFileName,
  downloadProjectDocument,
  parseProjectDocument,
  readProjectFile,
  reconcilePricingSnapshot,
} from "./lib/projectPersistence";

const PlannerLayout = ({
  onExportProject,
  onImportProject,
  pricingReference,
  projectTransferFeedback,
  roomDimensionsForm,
}) => {
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
          <PlannerSummaryPanel
            appliedRoomDimensions={roomDimensionsForm.appliedRoomDimensions}
            onExportProject={onExportProject}
            onImportProject={onImportProject}
            pricingReference={pricingReference}
            projectTransferFeedback={projectTransferFeedback}
          />
        </aside>
      </div>
    </div>
  );
};

const PlannerWorkspace = ({ roomDimensionsForm }) => {
  const { cupboards, loadProject, pricingSummary } = useCupboards();
  const [pricingReferenceSource, setPricingReferenceSource] = useState(null);
  const [projectTransferFeedback, setProjectTransferFeedback] = useState(null);

  const pricingReference = useMemo(() => {
    if (!pricingReferenceSource?.snapshot) {
      return null;
    }

    return {
      ...pricingReferenceSource,
      comparison: reconcilePricingSnapshot({
        currentPricingSummary: pricingSummary,
        pricingSnapshot: pricingReferenceSource.snapshot,
      }),
    };
  }, [pricingReferenceSource, pricingSummary]);

  const handleExportProject = useCallback(() => {
    const projectDocument = createProjectDocument({
      cupboards,
      pricingSummary,
      roomDimensions: roomDimensionsForm.appliedRoomDimensions,
    });
    const fileName = createProjectFileName(projectDocument);

    downloadProjectDocument(projectDocument, fileName);
    setPricingReferenceSource({
      snapshot: projectDocument.pricingSnapshot,
      source: "export",
      fileName,
      projectName: projectDocument.projectName,
      savedAt: projectDocument.savedAt,
      catalogVersion: projectDocument.catalogVersion,
    });
    setProjectTransferFeedback({
      tone: "success",
      message: `Project exported to ${fileName}. The saved pricing snapshot below now matches that file.`,
    });
  }, [cupboards, pricingSummary, roomDimensionsForm.appliedRoomDimensions]);

  const handleImportProject = useCallback(
    async (file) => {
      try {
        const projectDocumentText = await readProjectFile(file);
        const importedProject = parseProjectDocument(projectDocumentText);

        loadProject(importedProject.cupboards);
        roomDimensionsForm.applyImportedRoom(
          importedProject.roomDimensions,
          importedProject.projectName || file?.name || "Imported project",
        );
        setPricingReferenceSource({
          snapshot: importedProject.pricingSnapshot,
          source: "import",
          fileName: file?.name ?? null,
          projectName: importedProject.projectName,
          savedAt: importedProject.savedAt,
          catalogVersion: importedProject.catalogVersion,
        });
        setProjectTransferFeedback({
          tone: "info",
          message: `Imported ${file?.name ?? importedProject.projectName}. Review the pricing comparison below before treating the live total as final.`,
        });
      } catch (error) {
        setProjectTransferFeedback({
          tone: "error",
          message: error instanceof Error ? error.message : "Unable to import that project file.",
        });
      }
    },
    [loadProject, roomDimensionsForm],
  );

  return (
    <PlannerLayout
      onExportProject={handleExportProject}
      onImportProject={handleImportProject}
      pricingReference={pricingReference}
      projectTransferFeedback={projectTransferFeedback}
      roomDimensionsForm={roomDimensionsForm}
    />
  );
};

const PlannerPage = () => {
  const roomDimensionsForm = useRoomDimensionsForm();

  return (
    <RoomSceneProvider dimensions={roomDimensionsForm.sceneDimensions}>
      <CupboardProvider>
        <PlannerWorkspace roomDimensionsForm={roomDimensionsForm} />
      </CupboardProvider>
    </RoomSceneProvider>
  );
};

export default PlannerPage;
