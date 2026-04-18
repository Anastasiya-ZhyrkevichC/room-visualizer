import React from "react";

import { CUPBOARD_RESIZE_SIDES } from "../model/placement";
import { useCupboards } from "../state/CupboardProvider";

const HANDLE_HIT_TARGET_SIZE = [0.14, 0.56, 0.18];
const HANDLE_BODY_SIZE = [0.032, 0.34, 0.038];
const HANDLE_CAP_SIZE = [0.05, 0.06, 0.05];
const HANDLE_EDGE_GAP = 0.02;
const HANDLE_FRONT_OFFSET = 0.085;
const HANDLE_BASE_COLOR = "#fff2c8";
const HANDLE_ACTIVE_COLOR = "#ffc65a";
const HANDLE_INVALID_COLOR = "#ff8f7a";
const HANDLE_DISABLED_COLOR = "#9b8c7f";
const HANDLE_EMISSIVE_COLOR = "#7a351a";
const HANDLE_DISABLED_EMISSIVE_COLOR = "#4b4036";

const stopSceneEvent = (event) => {
  event.stopPropagation();

  if (typeof event.nativeEvent?.preventDefault === "function") {
    event.nativeEvent.preventDefault();
  }

  if (typeof event.nativeEvent?.stopImmediatePropagation === "function") {
    event.nativeEvent.stopImmediatePropagation();
  }
};

const ResizeHandle = ({ disabled = false, isActive = false, isInvalid = false, onResizeStart, position }) => {
  const fillColor = disabled
    ? HANDLE_DISABLED_COLOR
    : isInvalid
      ? HANDLE_INVALID_COLOR
      : isActive
        ? HANDLE_ACTIVE_COLOR
        : HANDLE_BASE_COLOR;
  const emissiveColor = disabled ? HANDLE_DISABLED_EMISSIVE_COLOR : HANDLE_EMISSIVE_COLOR;
  const emissiveIntensity = disabled ? 0.04 : isActive ? 0.2 : 0.14;

  return (
    <group
      position={position}
      onPointerDown={(event) => {
        if (disabled || event.button !== 0) {
          return;
        }

        stopSceneEvent(event);
        onResizeStart?.();
      }}
      onClick={stopSceneEvent}
    >
      <mesh>
        <boxGeometry args={HANDLE_HIT_TARGET_SIZE} />
        <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
      </mesh>
      <mesh>
        <boxGeometry args={HANDLE_BODY_SIZE} />
        <meshStandardMaterial
          color={fillColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.4}
          metalness={0.14}
        />
      </mesh>
      <mesh position={[0, HANDLE_BODY_SIZE[1] / 2 + HANDLE_CAP_SIZE[1] / 2 - 0.01, 0]}>
        <boxGeometry args={HANDLE_CAP_SIZE} />
        <meshStandardMaterial
          color={fillColor}
          emissive={emissiveColor}
          emissiveIntensity={Math.max(emissiveIntensity - 0.02, 0)}
          roughness={0.4}
          metalness={0.12}
        />
      </mesh>
      <mesh position={[0, -HANDLE_BODY_SIZE[1] / 2 - HANDLE_CAP_SIZE[1] / 2 + 0.01, 0]}>
        <boxGeometry args={HANDLE_CAP_SIZE} />
        <meshStandardMaterial
          color={fillColor}
          emissive={emissiveColor}
          emissiveIntensity={Math.max(emissiveIntensity - 0.02, 0)}
          roughness={0.4}
          metalness={0.12}
        />
      </mesh>
    </group>
  );
};

const SelectedCupboardWidthControls = ({ cupboard }) => {
  const { activeResize, isMoveActive, isPlacementActive, isResizeActive, startCupboardResize } = useCupboards();

  if (!cupboard || isMoveActive || isPlacementActive || (cupboard.availableWidths?.length ?? 0) < 2) {
    return null;
  }

  const horizontalOffset = cupboard.size[0] / 2 + HANDLE_HIT_TARGET_SIZE[0] / 2 + HANDLE_EDGE_GAP;
  const depthOffset = cupboard.size[2] / 2 + HANDLE_FRONT_OFFSET;
  const activeSide = activeResize?.cupboardId === cupboard.id ? activeResize.side : null;
  const isActiveResizeInvalid = activeResize?.cupboardId === cupboard.id && activeResize?.validation?.isValid === false;
  const isHandleInteractionDisabled = isResizeActive;

  return (
    <group
      position={[cupboard.position.x, cupboard.position.y, cupboard.position.z]}
      rotation={[0, cupboard.rotation, 0]}
    >
      <ResizeHandle
        side={CUPBOARD_RESIZE_SIDES.LEFT}
        disabled={isHandleInteractionDisabled}
        isActive={activeSide === CUPBOARD_RESIZE_SIDES.LEFT}
        isInvalid={activeSide === CUPBOARD_RESIZE_SIDES.LEFT && isActiveResizeInvalid}
        onResizeStart={() => startCupboardResize(cupboard.id, CUPBOARD_RESIZE_SIDES.LEFT)}
        position={[-horizontalOffset, 0, depthOffset]}
      />
      <ResizeHandle
        side={CUPBOARD_RESIZE_SIDES.RIGHT}
        disabled={isHandleInteractionDisabled}
        isActive={activeSide === CUPBOARD_RESIZE_SIDES.RIGHT}
        isInvalid={activeSide === CUPBOARD_RESIZE_SIDES.RIGHT && isActiveResizeInvalid}
        onResizeStart={() => startCupboardResize(cupboard.id, CUPBOARD_RESIZE_SIDES.RIGHT)}
        position={[horizontalOffset, 0, depthOffset]}
      />
    </group>
  );
};

export default SelectedCupboardWidthControls;
