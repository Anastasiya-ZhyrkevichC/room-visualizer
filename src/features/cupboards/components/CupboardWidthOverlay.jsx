import React from "react";
import { Billboard, Text } from "@react-three/drei";

import { getCabinetDimensionTheme } from "../lib/cabinetAppearance";
import formatWidthLabel from "../lib/formatWidthLabel";

export const DIMENSION_Y_OFFSET = 0.06;
export const DIMENSION_LABEL_LIFT = 0.07;
export const DIMENSION_CAP_HEIGHT = 0.08;
export const DIMENSION_TEXT_FONT_SIZE = 0.045;
export const DIMENSION_WALL_INSET = 0.01;

const DIMENSION_LINE_THICKNESS = 0.012;
const DIMENSION_CAP_THICKNESS = 0.012;
const DIMENSION_TEXT_OUTLINE_WIDTH = 0;
const DIMENSION_LABEL_BACKGROUND_OPACITY = 0.92;
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

  const width = size[0];
  const lineY = size[1] / 2 + DIMENSION_Y_OFFSET;
  const wallZ = -size[2] / 2 + DIMENSION_WALL_INSET;

  return {
    linePosition: [0, lineY, wallZ],
    lineSize: [width, DIMENSION_LINE_THICKNESS, DIMENSION_LINE_THICKNESS],
    labelPosition: [0, lineY + DIMENSION_LABEL_LIFT, wallZ],
    startPoint: [-width / 2, lineY, wallZ],
    endPoint: [width / 2, lineY, wallZ],
    leftCapPosition: [-width / 2, lineY, wallZ],
    rightCapPosition: [width / 2, lineY, wallZ],
    capSize: [DIMENSION_CAP_THICKNESS, DIMENSION_CAP_HEIGHT, DIMENSION_CAP_THICKNESS],
  };
};

const getLabelBackgroundSize = (label) => [
  Math.max(label.length * DIMENSION_TEXT_FONT_SIZE * 0.5, DIMENSION_TEXT_FONT_SIZE * 3.2),
  DIMENSION_TEXT_FONT_SIZE * 1.65,
];

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
  const labelBackgroundSize = getLabelBackgroundSize(label);

  return (
    <group position={toPositionProp(position)} rotation={[0, rotation, 0]}>
      <mesh position={geometry.linePosition} raycast={disableRaycast} renderOrder={10}>
        <boxGeometry args={geometry.lineSize} />
        <meshBasicMaterial
          color={theme.color}
          transparent
          opacity={theme.opacity}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh position={geometry.leftCapPosition} raycast={disableRaycast} renderOrder={10}>
        <boxGeometry args={geometry.capSize} />
        <meshBasicMaterial
          color={theme.color}
          transparent
          opacity={theme.opacity}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh position={geometry.rightCapPosition} raycast={disableRaycast} renderOrder={10}>
        <boxGeometry args={geometry.capSize} />
        <meshBasicMaterial
          color={theme.color}
          transparent
          opacity={theme.opacity}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <Billboard follow lockX={false} lockY={false} lockZ={false} position={geometry.labelPosition}>
        <mesh raycast={disableRaycast} renderOrder={11}>
          <planeGeometry args={labelBackgroundSize} />
          <meshBasicMaterial
            color={theme.labelBackgroundColor}
            transparent
            opacity={DIMENSION_LABEL_BACKGROUND_OPACITY}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
        <Text
          raycast={disableRaycast}
          color={theme.textColor}
          fontSize={DIMENSION_TEXT_FONT_SIZE}
          anchorX="center"
          anchorY="middle"
          textAlign="center"
          outlineWidth={DIMENSION_TEXT_OUTLINE_WIDTH}
          outlineColor={theme.outlineColor}
          renderOrder={12}
        >
          {label}
        </Text>
      </Billboard>
    </group>
  );
};

export default CupboardWidthOverlay;
