import React from "react";

import { useCupboards } from "../state/CupboardProvider";
import { CupboardMesh, GhostCupboardMesh } from "./CupboardMesh";

const CupboardRenderer = () => {
  const { activeMove, cupboards, placementPreview, selectedCupboardId, selectCupboard, startCupboardMove } =
    useCupboards();

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
          isMoving={cupboard.id === activeMove?.cupboardId}
          isSelected={cupboard.id === selectedCupboardId}
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
        />
      ) : null}
    </>
  );
};

export default CupboardRenderer;
