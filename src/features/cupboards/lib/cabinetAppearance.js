const clampChannel = (value) => Math.min(255, Math.max(0, Math.round(value)));

const normalizeHex = (value, fallback) => {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim().replace("#", "");

  if (/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return `#${normalized.toLowerCase()}`;
  }

  return fallback;
};

const splitHex = (value, fallback) => {
  const normalized = normalizeHex(value, fallback).slice(1);

  return [0, 2, 4].map((index) => Number.parseInt(normalized.slice(index, index + 2), 16));
};

const mixHexColors = (firstColor, secondColor, weight = 0.5, fallback = "#000000") => {
  const normalizedWeight = Math.min(Math.max(weight, 0), 1);
  const [firstRed, firstGreen, firstBlue] = splitHex(firstColor, fallback);
  const [secondRed, secondGreen, secondBlue] = splitHex(secondColor, fallback);

  return `#${[firstRed, firstGreen, firstBlue]
    .map((channel, index) =>
      clampChannel(channel + ([secondRed, secondGreen, secondBlue][index] - channel) * normalizedWeight)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
};

const baseCabinetTheme = Object.freeze({
  bodyColor: "#b89b78",
  frontColor: "#efe1cf",
  interiorColor: "#9d7c5d",
  handleColor: "#5d564e",
  legColor: "#4b4036",
  emissiveColor: "#2f2015",
  emissiveIntensity: 0.03,
  opacity: 1,
  transparent: false,
});

const resolveBaseTheme = (appearanceTheme = {}) => {
  const normalizedAppearanceTheme = appearanceTheme ?? {};

  return {
    ...baseCabinetTheme,
    bodyColor: normalizeHex(normalizedAppearanceTheme.bodyColor, baseCabinetTheme.bodyColor),
    frontColor: normalizeHex(normalizedAppearanceTheme.frontColor, baseCabinetTheme.frontColor),
    interiorColor: normalizeHex(normalizedAppearanceTheme.interiorColor, baseCabinetTheme.interiorColor),
    handleColor: normalizeHex(normalizedAppearanceTheme.handleColor, baseCabinetTheme.handleColor),
    legColor: normalizeHex(normalizedAppearanceTheme.legColor, baseCabinetTheme.legColor),
  };
};

const tintTheme = (
  theme,
  { tintColor, tintWeight, emissiveColor, emissiveIntensity, opacity = 1, transparent = false },
) => ({
  ...theme,
  bodyColor: mixHexColors(theme.bodyColor, tintColor, tintWeight, theme.bodyColor),
  frontColor: mixHexColors(theme.frontColor, tintColor, tintWeight, theme.frontColor),
  interiorColor: mixHexColors(theme.interiorColor, tintColor, tintWeight, theme.interiorColor),
  handleColor: mixHexColors(theme.handleColor, tintColor, Math.min(tintWeight + 0.12, 0.95), theme.handleColor),
  legColor: mixHexColors(theme.legColor, tintColor, tintWeight, theme.legColor),
  emissiveColor,
  emissiveIntensity,
  opacity,
  transparent,
});

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

  return isGhost ? 1.02 : 1.001;
};

export const getKitchenCabinetTheme = ({
  appearanceTheme = null,
  isGhost = false,
  isMoving = false,
  isSelected = false,
  isInvalid = false,
}) => {
  const resolvedBaseTheme = resolveBaseTheme(appearanceTheme);

  if (isInvalid) {
    return tintTheme(resolvedBaseTheme, {
      tintColor: isGhost ? "#ffb0a9" : "#ff8b7c",
      tintWeight: isGhost ? 0.58 : 0.44,
      emissiveColor: isGhost ? "#9f2124" : "#8f1f25",
      emissiveIntensity: isGhost ? 0.3 : 0.24,
      opacity: isGhost ? 0.42 : 1,
      transparent: isGhost,
    });
  }

  if (isGhost) {
    return tintTheme(resolvedBaseTheme, {
      tintColor: "#f4c791",
      tintWeight: 0.42,
      emissiveColor: "#8f471d",
      emissiveIntensity: 0.22,
      opacity: 0.38,
      transparent: true,
    });
  }

  if (isMoving) {
    return tintTheme(resolvedBaseTheme, {
      tintColor: "#e6b487",
      tintWeight: 0.28,
      emissiveColor: "#8b411d",
      emissiveIntensity: 0.18,
    });
  }

  if (isSelected) {
    return tintTheme(resolvedBaseTheme, {
      tintColor: "#f2dfc6",
      tintWeight: 0.24,
      emissiveColor: "#7a351a",
      emissiveIntensity: 0.16,
    });
  }

  return resolvedBaseTheme;
};

export const getSimpleCupboardMaterialProps = ({
  appearanceTheme = null,
  isGhost = false,
  isMoving = false,
  isSelected = false,
  isInvalid = false,
}) => {
  const theme = getKitchenCabinetTheme({
    appearanceTheme,
    isGhost,
    isMoving,
    isSelected,
    isInvalid,
  });

  return {
    color: theme.bodyColor,
    emissive: theme.emissiveColor,
    emissiveIntensity: theme.emissiveIntensity,
    opacity: theme.opacity,
    transparent: theme.transparent,
    roughness: 0.84,
    metalness: 0.04,
  };
};

export const getCabinetDimensionTheme = ({ isGhost = false, isInvalid = false, isActive = false }) => {
  if (isInvalid) {
    return isGhost
      ? {
          color: "#ffb1a7",
          textColor: "#8b2f2b",
          outlineColor: "#2a1311",
          labelBackgroundColor: "#2a1311",
          opacity: 0.92,
        }
      : {
          color: "#ff8f7a",
          textColor: "#7b231f",
          outlineColor: "#24100f",
          labelBackgroundColor: "#24100f",
          opacity: 1,
        };
  }

  if (isGhost) {
    return {
      color: "#ffe3b8",
      textColor: "#8a5b22",
      outlineColor: "#1f1913",
      labelBackgroundColor: "#1f1913",
      opacity: 0.88,
    };
  }

  if (isActive) {
    return {
      color: "#ffc65a",
      textColor: "#7c4c14",
      outlineColor: "#1c1611",
      labelBackgroundColor: "#1c1611",
      opacity: 1,
    };
  }

  return {
    color: "#d8c6a0",
    textColor: "#6c5231",
    outlineColor: "#1a1713",
    labelBackgroundColor: "#1a1713",
    opacity: 0.78,
  };
};
