import React from "react";

import { SolidCupboard } from "./CupBoard";
import { useCupboards } from "./CupBoardProvider";

const CupBoardRenderer = () => {
  const { cupboards, selectedCupboardId, selectCupboard } = useCupboards();

  return (
    <>
      {cupboards.map((cupboard) => (
        <SolidCupboard
          key={cupboard.id}
          position={cupboard.position}
          rotation={[0, cupboard.rotation, 0]}
          size={cupboard.size}
          isSelected={cupboard.id === selectedCupboardId}
          onSelect={() => selectCupboard(cupboard.id)}
        />
      ))}
    </>
  );
};

export default CupBoardRenderer;
