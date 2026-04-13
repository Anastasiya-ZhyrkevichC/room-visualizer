import React from "react";

import { useCupboards } from "../state/CupboardProvider";
import { CupboardMesh, GhostCupboardMesh } from "./CupboardMesh";

const CupboardRenderer = () => {
  const { cupboards, placementPreview, selectedCupboardId, selectCupboard } = useCupboards();

  return (
    <>
      {cupboards.map((cupboard) => (
        <CupboardMesh
          key={cupboard.id}
          position={cupboard.position}
          rotation={cupboard.rotation}
          size={cupboard.size}
          isSelected={cupboard.id === selectedCupboardId}
          onSelect={() => selectCupboard(cupboard.id)}
        />
      ))}

      {placementPreview ? (
        <GhostCupboardMesh
          position={placementPreview.position}
          rotation={placementPreview.rotation}
          size={placementPreview.size}
        />
      ) : null}
    </>
  );
};

export default CupboardRenderer;
