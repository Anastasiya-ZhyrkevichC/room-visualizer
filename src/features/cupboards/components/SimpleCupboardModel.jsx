import React from "react";

import { getSimpleCupboardMaterialProps } from "../lib/cabinetAppearance";

const SimpleCupboardModel = ({ size, isGhost = false, isMoving = false, isSelected = false, isInvalid = false }) => (
  <mesh>
    <boxGeometry args={size} />
    <meshStandardMaterial {...getSimpleCupboardMaterialProps({ isGhost, isMoving, isSelected, isInvalid })} />
  </mesh>
);

export default SimpleCupboardModel;
