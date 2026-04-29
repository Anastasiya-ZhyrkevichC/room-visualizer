import React from "react";

import { resolveCupboardAppearanceTheme, resolveCupboardModelWithCustomisation } from "../model/customization";
import { useCupboards } from "../state/CupboardProvider";
import { CupboardMesh, GhostCupboardMesh } from "./CupboardMesh";
import CupboardWidthOverlay from "./CupboardWidthOverlay";
import SelectedCupboardWidthControls from "./SelectedCupboardWidthControls";

const CupboardRenderer = () => {
  const {
    activeMove,
    activeResize,
    cupboards,
    placementPreview,
    projectCustomisation,
    selectedCupboard,
    selectedCupboardId,
    selectCupboard,
    startCupboardMove,
  } = useCupboards();
  const activeMoveCupboardId = activeMove?.cupboardId ?? null;
  const activeResizeCupboardId = activeResize?.cupboardId ?? null;
  const isActiveMoveInvalid = Boolean(activeMove && activeMove.validation?.isValid === false);
  const isActiveResizeInvalid = Boolean(activeResize && activeResize.validation?.isValid === false);
  const isPlacementPreviewInvalid = Boolean(placementPreview && placementPreview.validation?.isValid === false);

  return (
    <>
      {cupboards.flatMap((cupboard) => {
        const isMoving = cupboard.id === activeMoveCupboardId;
        const isSelected = cupboard.id === selectedCupboardId;
        const isInvalid =
          (cupboard.id === activeMoveCupboardId && isActiveMoveInvalid) ||
          (cupboard.id === activeResizeCupboardId && isActiveResizeInvalid);
        const appearanceTheme = resolveCupboardAppearanceTheme(cupboard, projectCustomisation);
        const resolvedModel = resolveCupboardModelWithCustomisation(cupboard, projectCustomisation);

        return [
          <CupboardMesh
            key={`cupboard-${cupboard.id}`}
            position={cupboard.position}
            rotation={cupboard.rotation}
            size={cupboard.size}
            category={cupboard.category}
            model={resolvedModel}
            appearanceTheme={appearanceTheme}
            isMoving={isMoving}
            isSelected={isSelected}
            isInvalid={isInvalid}
            onMoveStart={
              cupboard.id === selectedCupboardId && cupboard.id !== activeResizeCupboardId
                ? () => startCupboardMove(cupboard.id)
                : undefined
            }
            onSelect={() => selectCupboard(cupboard.id)}
          />,
          <CupboardWidthOverlay
            key={`cupboard-width-overlay-${cupboard.id}`}
            position={cupboard.position}
            rotation={cupboard.rotation}
            size={cupboard.size}
            widthMm={cupboard.width}
            isInvalid={isInvalid}
            isActive
          />,
        ];
      })}

      {placementPreview
        ? [
            <GhostCupboardMesh
              key="placement-preview"
              position={placementPreview.position}
              rotation={placementPreview.rotation}
              size={placementPreview.size}
              category={placementPreview.category}
              model={resolveCupboardModelWithCustomisation(placementPreview, projectCustomisation)}
              appearanceTheme={resolveCupboardAppearanceTheme(placementPreview, projectCustomisation)}
              isInvalid={isPlacementPreviewInvalid}
            />,
            <CupboardWidthOverlay
              key="placement-preview-width-overlay"
              position={placementPreview.position}
              rotation={placementPreview.rotation}
              size={placementPreview.size}
              widthMm={placementPreview.width}
              isGhost
              isInvalid={isPlacementPreviewInvalid}
              isActive
            />,
          ]
        : null}

      {selectedCupboard ? <SelectedCupboardWidthControls cupboard={selectedCupboard} /> : null}
    </>
  );
};

export default CupboardRenderer;
