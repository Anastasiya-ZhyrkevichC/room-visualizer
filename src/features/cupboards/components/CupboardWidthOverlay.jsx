import React from "react";
import { Text } from "@react-three/drei";

import { getCabinetDimensionTheme } from "../lib/cabinetAppearance";
import formatWidthLabel from "../lib/formatWidthLabel";

export const DIMENSION_Y_OFFSET = 0.06;
export const DIMENSION_LABEL_LIFT = 0.07;
export const DIMENSION_TEXT_FONT_SIZE = 0.045;
export const DIMENSION_WALL_INSET = 0.01;

const disableRaycast = () => null;

const toPositionProp = (position) => (Array.isArray(position) ? position : [position.x, position.y, position.z]);

export const hasRenderableOverlaySize = (size) =>
  Array.isArray(size) &&
  size.length >= 3 &&
  Number.isFinite(size[0]) &&
  Number.isFinite(size[1]) &&
  Number.isFinite(size[2]) &&
  size[0] > 0 &&
  size[2] >= 0;

export const getWidthOverlayGeometry = (size) => {
  if (!hasRenderableOverlaySize(size)) {
    return null;
  }

  const labelY = size[1] / 2 + DIMENSION_Y_OFFSET + DIMENSION_LABEL_LIFT;
  const wallZ = -size[2] / 2 + DIMENSION_WALL_INSET;

  return {
    labelPosition: [0, labelY, wallZ],
    maxWidth: Math.max(size[0] - 0.08, 0.24),
  };
};

const CupboardWidthOverlay = ({
  position,
  rotation = 0,
  size,
  widthMm,
  isGhost = false,
  isInvalid = false,
  isActive = false,
}) => {
  const geometry = getWidthOverlayGeometry(size);
  const label = formatWidthLabel({ widthMm, size });

  if (!isActive || !geometry || !label) {
    return null;
  }

  const theme = getCabinetDimensionTheme({ isGhost, isInvalid, isActive });

  return (
    <group position={toPositionProp(position)} rotation={[0, rotation, 0]}>
      <Text
        raycast={disableRaycast}
        position={geometry.labelPosition}
        color={theme.textColor}
        fontSize={DIMENSION_TEXT_FONT_SIZE}
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        maxWidth={geometry.maxWidth}
        fillOpacity={theme.opacity}
        renderOrder={12}
        material-depthTest={false}
        material-depthWrite={false}
        material-toneMapped={false}
      >
        {label}
      </Text>
    </group>
  );
};

export default CupboardWidthOverlay;
