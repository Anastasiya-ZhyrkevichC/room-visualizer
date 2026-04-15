import { Edges } from "@react-three/drei";

import { CABINET_RENDER_MODES, resolveCabinetRenderMode } from "../../../config/plannerConfig";
import KitchenCabinetModel from "./KitchenCabinetModel";
import SimpleCupboardModel from "./SimpleCupboardModel";

const toPositionProp = (position) => (Array.isArray(position) ? position : [position.x, position.y, position.z]);
const cabinetRenderMode = resolveCabinetRenderMode();

const getOutlineColor = ({ isGhost = false, isMoving = false, isSelected = false }) => {
  if (isGhost) {
    return "#fff5dc";
  }

  if (isMoving || isSelected) {
    return "#fff7dc";
  }

  return "#2a3c53";
};

const CabinetOutline = ({ size, color, scale = 1.01 }) => (
  <mesh>
    <boxGeometry args={size} />
    <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
    <Edges scale={scale} threshold={15} color={color} />
  </mesh>
);

const RenderedCupboardBody = ({ size, category, model, isGhost = false, isMoving = false, isSelected = false }) =>
  cabinetRenderMode === CABINET_RENDER_MODES.BOX ? (
    <SimpleCupboardModel size={size} isGhost={isGhost} isMoving={isMoving} isSelected={isSelected} />
  ) : (
    <KitchenCabinetModel
      size={size}
      category={category}
      model={model}
      isGhost={isGhost}
      isMoving={isMoving}
      isSelected={isSelected}
    />
  );

export const GhostCupboardMesh = ({ position, rotation = 0, size, category, model }) => {
  return (
    <group position={toPositionProp(position)} rotation={[0, rotation, 0]}>
      <RenderedCupboardBody size={size} category={category} model={model} isGhost />
      <CabinetOutline size={size} color={getOutlineColor({ isGhost: true })} scale={1.02} />
    </group>
  );
};

export const CupboardMesh = ({
  position,
  rotation = 0,
  size,
  category,
  model,
  isMoving = false,
  isSelected = false,
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
      <RenderedCupboardBody size={size} category={category} model={model} isMoving={isMoving} isSelected={isSelected} />
      <CabinetOutline size={size} color={getOutlineColor({ isMoving, isSelected })} />
    </group>
  );
};
