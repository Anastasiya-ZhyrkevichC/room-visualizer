import React from "react";

import { SolidCupboard } from "./CupBoard";
import { useCupboards } from "./CupBoardProvider";

const CupBoardRenderer = () => {
  const { cupboards } = useCupboards();

  return (
    <>
      {cupboards.map((box, index) => (
        <SolidCupboard key={index} position={box.position} size={box.size} />
      ))}
    </>
  );
};

export default CupBoardRenderer;
