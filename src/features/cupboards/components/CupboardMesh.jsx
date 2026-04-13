import { Edges } from "@react-three/drei";

const toPositionProp = (position) => (Array.isArray(position) ? position : [position.x, position.y, position.z]);

export const GhostCupboardMesh = ({ position, rotation = 0, size }) => {
  return (
    <mesh position={toPositionProp(position)} rotation={[0, rotation, 0]}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#d8894a" emissive="#8f471d" emissiveIntensity={0.26} opacity={0.36} transparent />
      <Edges scale={1.02} threshold={15} color="#fff5dc" />
    </mesh>
  );
};

export const CupboardMesh = ({
  position,
  rotation = 0,
  size,
  isMoving = false,
  isSelected = false,
  onMoveStart,
  onSelect,
}) => {
  return (
    <mesh
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
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={isMoving ? "#d57d41" : isSelected ? "#c86f3d" : "#4f75b6"}
        emissive={isMoving ? "#8b411d" : isSelected ? "#7a351a" : "#25406f"}
        emissiveIntensity={isMoving ? 0.62 : isSelected ? 0.55 : 0.14}
      />
      <Edges scale={1.01} threshold={15} color={isMoving || isSelected ? "#fff7dc" : "#1f3966"} />
    </mesh>
  );
};
