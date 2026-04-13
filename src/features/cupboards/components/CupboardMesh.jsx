import { Edges } from "@react-three/drei";

import KitchenCabinetModel from "./KitchenCabinetModel";

const toPositionProp = (position) => (Array.isArray(position) ? position : [position.x, position.y, position.z]);

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

export const GhostCupboardMesh = ({ position, rotation = 0, size, category, model }) => {
  return (
    <group position={toPositionProp(position)} rotation={[0, rotation, 0]}>
      <KitchenCabinetModel size={size} category={category} model={model} isGhost />
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
      <KitchenCabinetModel
        size={size}
        category={category}
        model={model}
        isMoving={isMoving}
        isSelected={isSelected}
      />
      <CabinetOutline size={size} color={getOutlineColor({ isMoving, isSelected })} />
    </group>
  );
};
