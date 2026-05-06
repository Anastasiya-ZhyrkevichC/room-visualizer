import React from "react";

import { getSimpleCupboardMaterialProps } from "../lib/cabinetAppearance";

const SimpleCupboardModel = ({
  size,
  appearanceTheme = null,
  isGhost = false,
  isMoving = false,
  isSelected = false,
  isInvalid = false,
}) => (
  <mesh>
    <boxGeometry args={size} />
    <meshStandardMaterial
      {...getSimpleCupboardMaterialProps({
        appearanceTheme,
        isGhost,
        isMoving,
        isSelected,
        isInvalid,
      })}
    />
  </mesh>
);

export default SimpleCupboardModel;
