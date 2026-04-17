import React, { useMemo } from "react";

import { CUPBOARD_RESIZE_SIDES, getCupboardWidthStepOutcome } from "../model/placement";
import { useCupboards } from "../state/CupboardProvider";
import { useRoomScene } from "../../room/context/RoomSceneContext";

const BUTTON_SIZE = [0.14, 0.11, 0.035];
const BUTTON_EDGE_GAP = 0.06;
const BUTTON_FRONT_OFFSET = 0.08;
const BUTTON_TOP_OFFSET = 0.08;
const ENABLED_BUTTON_COLOR = "#fff7dc";
const ENABLED_ARROW_COLOR = "#6a3822";
const DISABLED_BUTTON_COLOR = "#8d8173";
const DISABLED_ARROW_COLOR = "#d5cabd";

const stopSceneEvent = (event) => {
  event.stopPropagation();

  if (typeof event.nativeEvent?.preventDefault === "function") {
    event.nativeEvent.preventDefault();
  }

  if (typeof event.nativeEvent?.stopImmediatePropagation === "function") {
    event.nativeEvent.stopImmediatePropagation();
  }
};

const WidthStepButton = ({ direction, disabled = false, onStep, position }) => (
  <group
    position={position}
    onPointerDown={stopSceneEvent}
    onClick={(event) => {
      stopSceneEvent(event);

      if (!disabled && onStep) {
        onStep();
      }
    }}
  >
    <mesh>
      <boxGeometry args={BUTTON_SIZE} />
      <meshStandardMaterial
        color={disabled ? DISABLED_BUTTON_COLOR : ENABLED_BUTTON_COLOR}
        emissive={disabled ? "#4b4036" : "#7a351a"}
        emissiveIntensity={disabled ? 0.04 : 0.16}
        opacity={disabled ? 0.48 : 0.96}
        transparent
        roughness={0.48}
        metalness={0.06}
      />
    </mesh>
    <mesh
      position={[0, 0, BUTTON_SIZE[2] / 2 + 0.01]}
      rotation={[0, 0, direction === "previous" ? Math.PI / 2 : -Math.PI / 2]}
    >
      <coneGeometry args={[0.032, 0.06, 3]} />
      <meshStandardMaterial
        color={disabled ? DISABLED_ARROW_COLOR : ENABLED_ARROW_COLOR}
        emissive={disabled ? "#4b4036" : "#7a351a"}
        emissiveIntensity={disabled ? 0.04 : 0.14}
        roughness={0.4}
        metalness={0.08}
      />
    </mesh>
  </group>
);

const SelectedCupboardWidthControls = ({ cupboard }) => {
  const { bounds } = useRoomScene();
  const {
    cupboards,
    decreaseSelectedCupboardWidth,
    increaseSelectedCupboardWidth,
    isMoveActive,
    isPlacementActive,
    isResizeActive,
  } = useCupboards();

  const previousWidthStep = useMemo(
    () =>
      cupboard
        ? getCupboardWidthStepOutcome({
            cupboard,
            direction: "previous",
            side: CUPBOARD_RESIZE_SIDES.LEFT,
            roomBounds: bounds,
            cupboards,
          })
        : null,
    [bounds, cupboard, cupboards],
  );
  const nextWidthStep = useMemo(
    () =>
      cupboard
        ? getCupboardWidthStepOutcome({
            cupboard,
            direction: "next",
            side: CUPBOARD_RESIZE_SIDES.RIGHT,
            roomBounds: bounds,
            cupboards,
          })
        : null,
    [bounds, cupboard, cupboards],
  );

  if (!cupboard || isMoveActive || isPlacementActive || isResizeActive) {
    return null;
  }

  const horizontalOffset = cupboard.size[0] / 2 + BUTTON_SIZE[0] / 2 + BUTTON_EDGE_GAP;
  const verticalOffset = cupboard.size[1] / 2 + BUTTON_TOP_OFFSET;
  const depthOffset = cupboard.size[2] / 2 + BUTTON_FRONT_OFFSET;

  return (
    <group
      position={[cupboard.position.x, cupboard.position.y, cupboard.position.z]}
      rotation={[0, cupboard.rotation, 0]}
    >
      <WidthStepButton
        direction="previous"
        disabled={!previousWidthStep?.isAvailable}
        onStep={() => decreaseSelectedCupboardWidth(CUPBOARD_RESIZE_SIDES.LEFT)}
        position={[-horizontalOffset, verticalOffset, depthOffset]}
      />
      <WidthStepButton
        direction="next"
        disabled={!nextWidthStep?.isAvailable}
        onStep={() => increaseSelectedCupboardWidth(CUPBOARD_RESIZE_SIDES.RIGHT)}
        position={[horizontalOffset, verticalOffset, depthOffset]}
      />
    </group>
  );
};

export default SelectedCupboardWidthControls;
