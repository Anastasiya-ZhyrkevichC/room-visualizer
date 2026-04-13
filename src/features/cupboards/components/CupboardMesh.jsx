import { Edges } from "@react-three/drei";

const toPositionProp = (position) => (Array.isArray(position) ? position : [position.x, position.y, position.z]);

export const GhostCupboardMesh = ({ position, size }) => {
  return (
    <mesh position={toPositionProp(position)}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="red" opacity={0.3} transparent depthWrite={false} />
    </mesh>
  );
};

export const CupboardMesh = ({ position, rotation = 0, size, isSelected = false, onSelect }) => {
  return (
    <mesh
      position={toPositionProp(position)}
      rotation={[0, rotation, 0]}
      onClick={(event) => {
        event.stopPropagation();

        if (onSelect) {
          onSelect();
        }
      }}
    >
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={isSelected ? "#c86f3d" : "#4f75b6"}
        emissive={isSelected ? "#7a351a" : "#25406f"}
        emissiveIntensity={isSelected ? 0.55 : 0.14}
      />
      <Edges scale={1.01} threshold={15} color={isSelected ? "#fff7dc" : "#1f3966"} />
    </mesh>
  );
};
