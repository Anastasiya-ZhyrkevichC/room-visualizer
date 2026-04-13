import React, { forwardRef } from "react";

import WallPlane from "./WallPlane";

const FloorPlane = forwardRef(({ position, size }, ref) => {
  return <WallPlane ref={ref} position={position} rotation={[-Math.PI / 2, 0, 0]} size={size} />;
});

export default FloorPlane;
