export const getCabinetOutlineColor = ({
  isGhost = false,
  isMoving = false,
  isSelected = false,
  isInvalid = false,
}) => {
  if (isInvalid) {
    return isGhost ? "#ff7f77" : "#b42318";
  }

  if (isGhost) {
    return "#fff5dc";
  }

  if (isMoving || isSelected) {
    return "#fff7dc";
  }

  return "#2a3c53";
};

export const getCabinetOutlineScale = ({ isGhost = false, isInvalid = false }) => {
  if (isInvalid) {
    return isGhost ? 1.035 : 1.025;
  }

  return isGhost ? 1.02 : 1.01;
};

export const getSimpleCupboardMaterialProps = ({
  isGhost = false,
  isMoving = false,
  isSelected = false,
  isInvalid = false,
}) => {
  if (isInvalid) {
    return isGhost
      ? {
          color: "#d86d63",
          emissive: "#9f2124",
          emissiveIntensity: 0.3,
          opacity: 0.42,
          transparent: true,
          roughness: 0.82,
          metalness: 0.03,
        }
      : {
          color: "#c85f58",
          emissive: "#8f1f25",
          emissiveIntensity: 0.24,
          opacity: 1,
          transparent: false,
          roughness: 0.8,
          metalness: 0.04,
        };
  }

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

export const getKitchenCabinetTheme = ({
  isGhost = false,
  isMoving = false,
  isSelected = false,
  isInvalid = false,
}) => {
  if (isInvalid) {
    return isGhost
      ? {
          bodyColor: "#dd7267",
          frontColor: "#ffd1cb",
          interiorColor: "#b84d43",
          handleColor: "#ffece8",
          legColor: "#8d3834",
          emissiveColor: "#9f2124",
          emissiveIntensity: 0.3,
          opacity: 0.42,
          transparent: true,
        }
      : {
          bodyColor: "#c96059",
          frontColor: "#ffd7d2",
          interiorColor: "#a74640",
          handleColor: "#fff0ed",
          legColor: "#743633",
          emissiveColor: "#8f1f25",
          emissiveIntensity: 0.24,
          opacity: 1,
          transparent: false,
        };
  }

  if (isGhost) {
    return {
      bodyColor: "#df9b63",
      frontColor: "#f6d7b4",
      interiorColor: "#c07e47",
      handleColor: "#fff0dc",
      legColor: "#8d5f35",
      emissiveColor: "#8f471d",
      emissiveIntensity: 0.22,
      opacity: 0.38,
      transparent: true,
    };
  }

  if (isMoving) {
    return {
      bodyColor: "#c18f64",
      frontColor: "#eed0b0",
      interiorColor: "#a67145",
      handleColor: "#fff2df",
      legColor: "#6d503b",
      emissiveColor: "#8b411d",
      emissiveIntensity: 0.18,
      opacity: 1,
      transparent: false,
    };
  }

  if (isSelected) {
    return {
      bodyColor: "#c9a37f",
      frontColor: "#f4e2cf",
      interiorColor: "#af835f",
      handleColor: "#fff5e8",
      legColor: "#664f40",
      emissiveColor: "#7a351a",
      emissiveIntensity: 0.16,
      opacity: 1,
      transparent: false,
    };
  }

  return {
    bodyColor: "#b89b78",
    frontColor: "#efe1cf",
    interiorColor: "#9d7c5d",
    handleColor: "#5d564e",
    legColor: "#4b4036",
    emissiveColor: "#2f2015",
    emissiveIntensity: 0.03,
    opacity: 1,
    transparent: false,
  };
};
