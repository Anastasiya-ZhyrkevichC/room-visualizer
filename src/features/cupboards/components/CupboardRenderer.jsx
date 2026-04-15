import React from "react";

import { useCupboards } from "../state/CupboardProvider";
import { CupboardMesh, GhostCupboardMesh } from "./CupboardMesh";

const CupboardRenderer = () => {
  const { activeMove, cupboards, placementPreview, selectedCupboardId, selectCupboard, startCupboardMove } =
    useCupboards();
  const activeMoveCupboardId = activeMove?.cupboardId ?? null;
  const isActiveMoveInvalid = Boolean(activeMove && activeMove.validation?.isValid === false);
  const isPlacementPreviewInvalid = Boolean(placementPreview && placementPreview.validation?.isValid === false);

  return (
    <>
      {cupboards.map((cupboard) => (
        <CupboardMesh
          key={cupboard.id}
          position={cupboard.position}
          rotation={cupboard.rotation}
          size={cupboard.size}
          category={cupboard.category}
          model={cupboard.model}
          isMoving={cupboard.id === activeMoveCupboardId}
          isSelected={cupboard.id === selectedCupboardId}
          isInvalid={cupboard.id === activeMoveCupboardId && isActiveMoveInvalid}
          onMoveStart={cupboard.id === selectedCupboardId ? () => startCupboardMove(cupboard.id) : undefined}
          onSelect={() => selectCupboard(cupboard.id)}
        />
      ))}

      {placementPreview ? (
        <GhostCupboardMesh
          position={placementPreview.position}
          rotation={placementPreview.rotation}
          size={placementPreview.size}
          category={placementPreview.category}
          model={placementPreview.model}
          isInvalid={isPlacementPreviewInvalid}
        />
      ) : null}
    </>
  );
};

export default CupboardRenderer;
