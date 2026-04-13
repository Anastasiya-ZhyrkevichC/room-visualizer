import { Edges } from "@react-three/drei";

const OpacityCupboard = ({ position, size }) => {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color="red"
        opacity={0.3} // Adjust transparency (0 = fully invisible, 1 = solid)
        transparent={true}
        depthWrite={false}
      />
    </mesh>
  );
};

const SolidCupboard = ({ position, rotation, size, isSelected, onSelect }) => {
  return (
    <mesh
      position={position}
      rotation={rotation}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
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

export { SolidCupboard, OpacityCupboard };
