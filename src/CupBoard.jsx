import * as THREE from "three";

const OpacityCupboard = ({ position, size }) => {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color="blue"
        opacity={0.5} // Adjust transparency (0 = fully invisible, 1 = solid)
        depthWrite={false}
      />
    </mesh>
  );
};

const SolidCupboard = ({ position, size }) => {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color="blue"
        opacity={1} // Adjust transparency (0 = fully invisible, 1 = solid)
        depthWrite={false}
      />
    </mesh>
  );
};

export { SolidCupboard, OpacityCupboard };
