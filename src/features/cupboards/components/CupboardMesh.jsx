import { Edges } from "@react-three/drei";

import { CABINET_RENDER_MODES, resolveCabinetRenderMode } from "../../../config/plannerConfig";
import { getCabinetOutlineColor, getCabinetOutlineScale } from "../lib/cabinetAppearance";
import KitchenCabinetModel from "./KitchenCabinetModel";
import SimpleCupboardModel from "./SimpleCupboardModel";

const toPositionProp = (position) => (Array.isArray(position) ? position : [position.x, position.y, position.z]);
const cabinetRenderMode = resolveCabinetRenderMode();

const CabinetOutline = ({ size, color, scale = 1.01 }) => (
  <mesh>
    <boxGeometry args={size} />
    <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
    <Edges scale={scale} threshold={15} color={color} />
  </mesh>
);

const RenderedCupboardBody = ({
  size,
  category,
  model,
  appearanceTheme = null,
  isGhost = false,
  isMoving = false,
  isSelected = false,
  isInvalid = false,
}) =>
  cabinetRenderMode === CABINET_RENDER_MODES.BOX ? (
    <SimpleCupboardModel
      size={size}
      appearanceTheme={appearanceTheme}
      isGhost={isGhost}
      isMoving={isMoving}
      isSelected={isSelected}
      isInvalid={isInvalid}
    />
  ) : (
    <KitchenCabinetModel
      size={size}
      category={category}
      model={model}
      appearanceTheme={appearanceTheme}
      isGhost={isGhost}
      isMoving={isMoving}
      isSelected={isSelected}
      isInvalid={isInvalid}
    />
  );

export const GhostCupboardMesh = ({
  position,
  rotation = 0,
  size,
  category,
  model,
  appearanceTheme = null,
  isInvalid = false,
}) => {
  return (
    <group position={toPositionProp(position)} rotation={[0, rotation, 0]}>
      <RenderedCupboardBody
        size={size}
        category={category}
        model={model}
        appearanceTheme={appearanceTheme}
        isGhost
        isInvalid={isInvalid}
      />
      <CabinetOutline
        size={size}
        color={getCabinetOutlineColor({ isGhost: true, isInvalid })}
        scale={getCabinetOutlineScale({ isGhost: true, isInvalid })}
      />
    </group>
  );
};

export const CupboardMesh = ({
  position,
  rotation = 0,
  size,
  category,
  model,
  appearanceTheme = null,
  isMoving = false,
  isSelected = false,
  isInvalid = false,
  onMoveStart,
  onSelect,
}) => {
  return (
    <group
      position={toPositionProp(position)}
      rotation={[0, rotation, 0]}
      onPointerDown={(event) => {
        if (!onMoveStart || event.button !== 0) {
          return;
        }

        event.stopPropagation();
        event.nativeEvent.preventDefault();

        if (typeof event.nativeEvent.stopImmediatePropagation === "function") {
          event.nativeEvent.stopImmediatePropagation();
        }

        onMoveStart();
      }}
      onClick={(event) => {
        event.stopPropagation();

        if (onSelect) {
          onSelect();
        }
      }}
    >
      <RenderedCupboardBody
        size={size}
        category={category}
        model={model}
        appearanceTheme={appearanceTheme}
        isMoving={isMoving}
        isSelected={isSelected}
        isInvalid={isInvalid}
      />
      <CabinetOutline
        size={size}
        color={getCabinetOutlineColor({ isMoving, isSelected, isInvalid })}
        scale={getCabinetOutlineScale({ isInvalid })}
      />
    </group>
  );
};
