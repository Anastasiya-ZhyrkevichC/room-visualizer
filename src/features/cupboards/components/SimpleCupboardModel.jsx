import React from "react";

const getBoxMaterialProps = ({ isGhost = false, isMoving = false, isSelected = false }) => {
  if (isGhost) {
    return {
      color: "#d99660",
      emissive: "#8f471d",
      emissiveIntensity: 0.14,
      opacity: 0.35,
      transparent: true,
      roughness: 0.86,
      metalness: 0.04,
    };
  }

  if (isMoving) {
    return {
      color: "#c5976c",
      emissive: "#7a351a",
      emissiveIntensity: 0.1,
      opacity: 1,
      transparent: false,
      roughness: 0.84,
      metalness: 0.04,
    };
  }

  if (isSelected) {
    return {
      color: "#cfab87",
      emissive: "#7a351a",
      emissiveIntensity: 0.08,
      opacity: 1,
      transparent: false,
      roughness: 0.82,
      metalness: 0.05,
    };
  }

  return {
    color: "#b69a79",
    emissive: "#2f2015",
    emissiveIntensity: 0.03,
    opacity: 1,
    transparent: false,
    roughness: 0.85,
    metalness: 0.04,
  };
};

const SimpleCupboardModel = ({ size, isGhost = false, isMoving = false, isSelected = false }) => (
  <mesh>
    <boxGeometry args={size} />
    <meshStandardMaterial {...getBoxMaterialProps({ isGhost, isMoving, isSelected })} />
  </mesh>
);

export default SimpleCupboardModel;
