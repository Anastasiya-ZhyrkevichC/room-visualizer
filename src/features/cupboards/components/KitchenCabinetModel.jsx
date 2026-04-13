import React from "react";

import { convertMillimetersToMeters } from "../../../lib/units";
import { resolveCabinetModel } from "../model/renderModel";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getCabinetTheme = ({ isGhost = false, isMoving = false, isSelected = false }) => {
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

const getPanelMaterialProps = (theme, tone) => {
  const colorByTone = {
    body: theme.bodyColor,
    front: theme.frontColor,
    interior: theme.interiorColor,
    handle: theme.handleColor,
    leg: theme.legColor,
  };

  return {
    color: colorByTone[tone] ?? theme.bodyColor,
    emissive: theme.emissiveColor,
    emissiveIntensity: tone === "handle" ? theme.emissiveIntensity * 0.5 : theme.emissiveIntensity,
    metalness: tone === "handle" ? 0.28 : 0.04,
    roughness: tone === "handle" ? 0.42 : 0.82,
    opacity: theme.opacity,
    transparent: theme.transparent,
  };
};

const BoxPart = ({ position, args, materialProps }) => (
  <mesh position={position}>
    <boxGeometry args={args} />
    <meshStandardMaterial {...materialProps} />
  </mesh>
);

const getCabinetMetrics = (size, category, model) => {
  const resolvedModel = resolveCabinetModel(category, model);
  const [width, height, depth] = size;
  const shellThickness = clamp(
    convertMillimetersToMeters(resolvedModel.shellThicknessMm),
    0.008,
    Math.min(width, height, depth) / 4,
  );
  const backPanelThickness = clamp(
    convertMillimetersToMeters(resolvedModel.backPanelThicknessMm),
    0.004,
    depth / 6,
  );
  const frontThickness = clamp(
    convertMillimetersToMeters(resolvedModel.frontThicknessMm),
    0.008,
    depth / 3,
  );
  const gap = clamp(convertMillimetersToMeters(resolvedModel.front?.gapMm ?? 4), 0.0015, Math.min(width, height) * 0.05);
  const legHeight =
    resolvedModel.legs?.enabled === true
      ? clamp(convertMillimetersToMeters(resolvedModel.legs.heightMm), 0.04, height * 0.28)
      : 0;
  const shellBottom = -height / 2 + legHeight;
  const carcassHeight = Math.max(height - legHeight, shellThickness * 3);
  const carcassCenterY = shellBottom + carcassHeight / 2;
  const interiorWidth = Math.max(width - shellThickness * 2, shellThickness);
  const interiorHeight = Math.max(carcassHeight - shellThickness * 2, shellThickness);
  const frontReveal = gap / 2;
  const interiorBackZ = -depth / 2 + backPanelThickness;
  const interiorFrontZ =
    resolvedModel.front && resolvedModel.front.hasFacade !== false
      ? depth / 2 - frontThickness - frontReveal
      : depth / 2 - frontReveal;
  const interiorDepth = Math.max(interiorFrontZ - interiorBackZ, shellThickness);
  const interiorCenterZ = (interiorBackZ + interiorFrontZ) / 2;
  const legInset =
    resolvedModel.legs?.enabled === true
      ? clamp(
          convertMillimetersToMeters(resolvedModel.legs.insetMm),
          0,
          Math.max(0, Math.min(width / 2 - shellThickness, depth / 2 - shellThickness)),
        )
      : 0;
  const legWidth =
    resolvedModel.legs?.enabled === true
      ? clamp(convertMillimetersToMeters(resolvedModel.legs.widthMm), 0.02, width / 3)
      : 0;
  const legDepth =
    resolvedModel.legs?.enabled === true
      ? clamp(convertMillimetersToMeters(resolvedModel.legs.depthMm), 0.02, depth / 3)
      : 0;

  return {
    width,
    height,
    depth,
    shellThickness,
    backPanelThickness,
    frontThickness,
    gap,
    frontReveal,
    legHeight,
    shellBottom,
    carcassHeight,
    carcassCenterY,
    interiorWidth,
    interiorHeight,
    interiorDepth,
    interiorCenterZ,
    legInset,
    legWidth,
    legDepth,
    model: resolvedModel,
  };
};

const getCabinetBodyParts = (metrics) => {
  const { width, depth, shellThickness, shellBottom, carcassHeight, carcassCenterY, interiorWidth, backPanelThickness } =
    metrics;

  return [
    {
      key: "left-side",
      position: [-width / 2 + shellThickness / 2, carcassCenterY, 0],
      args: [shellThickness, carcassHeight, depth],
      tone: "body",
    },
    {
      key: "right-side",
      position: [width / 2 - shellThickness / 2, carcassCenterY, 0],
      args: [shellThickness, carcassHeight, depth],
      tone: "body",
    },
    {
      key: "bottom-panel",
      position: [0, shellBottom + shellThickness / 2, 0],
      args: [interiorWidth, shellThickness, depth],
      tone: "body",
    },
    {
      key: "top-panel",
      position: [0, shellBottom + carcassHeight - shellThickness / 2, 0],
      args: [interiorWidth, shellThickness, depth],
      tone: "body",
    },
    {
      key: "back-panel",
      position: [0, carcassCenterY, -depth / 2 + backPanelThickness / 2],
      args: [interiorWidth, Math.max(carcassHeight - shellThickness * 2, shellThickness), backPanelThickness],
      tone: "interior",
    },
  ];
};

const getShelfParts = (metrics) => {
  const { model, shellBottom, shellThickness, interiorWidth, interiorHeight, interiorDepth, interiorCenterZ } = metrics;
  const shelfCount = Math.max(model.shelfCount ?? 0, 0);

  return Array.from({ length: shelfCount }, (_, index) => ({
    key: `shelf-${index + 1}`,
    position: [
      0,
      shellBottom + shellThickness + (interiorHeight * (index + 1)) / (shelfCount + 1),
      interiorCenterZ,
    ],
    args: [interiorWidth, shellThickness * 0.88, interiorDepth],
    tone: "interior",
  }));
};

const getHandlePart = ({ key, centerX, centerY, panelWidth, panelHeight, depth, handle, isHorizontal = false }) => {
  if (!handle) {
    return null;
  }

  const length = clamp(
    convertMillimetersToMeters(handle.lengthMm),
    0.06,
    isHorizontal ? panelWidth * 0.75 : panelHeight * 0.75,
  );
  const thickness = clamp(convertMillimetersToMeters(handle.thicknessMm), 0.008, 0.02);
  const projection = clamp(convertMillimetersToMeters(handle.projectionMm), 0.012, 0.05);

  return {
    key,
    position: [centerX, centerY, depth / 2 + projection / 2],
    args: isHorizontal ? [length, thickness, projection] : [thickness, length, projection],
    tone: "handle",
  };
};

const getDoubleDoorFrontParts = (metrics) => {
  const { width, depth, shellBottom, carcassHeight, frontThickness, frontReveal, gap, model } = metrics;
  const doorCount = Math.max(model.front?.doorCount ?? 2, 1);
  const availableWidth = Math.max(width - frontReveal * 2 - gap * (doorCount - 1), width / 4);
  const doorWidth = availableWidth / doorCount;
  const doorHeight = Math.max(carcassHeight - frontReveal * 2, frontThickness);
  const centerY = shellBottom + carcassHeight / 2;
  const startX = -width / 2 + frontReveal + doorWidth / 2;
  const parts = [];

  for (let index = 0; index < doorCount; index += 1) {
    const centerX = startX + index * (doorWidth + gap);

    parts.push({
      key: `door-${index + 1}`,
      position: [centerX, centerY, depth / 2 - frontThickness / 2],
      args: [doorWidth, doorHeight, frontThickness],
      tone: "front",
    });

    const handle = model.front?.handle;
    const handleInset = clamp(
      convertMillimetersToMeters(handle?.insetMm ?? 44),
      0.01,
      Math.max(0.01, doorWidth / 2 - 0.01),
    );
    const handleDirection = doorCount === 1 ? 1 : index === 0 ? 1 : -1;
    const handleX =
      centerX + handleDirection * Math.max(doorWidth / 2 - handleInset, convertMillimetersToMeters(16));

    const handlePart = getHandlePart({
      key: `door-handle-${index + 1}`,
      centerX: handleX,
      centerY,
      panelWidth: doorWidth,
      panelHeight: doorHeight,
      depth,
      handle,
      isHorizontal: handle?.orientation === "horizontal",
    });

    if (handlePart) {
      parts.push(handlePart);
    }
  }

  return parts;
};

const getDrawerFrontParts = (metrics) => {
  const { width, depth, shellBottom, carcassHeight, frontThickness, frontReveal, gap, model } = metrics;
  const drawerCount = Math.max(model.front?.drawerCount ?? 3, 1);
  const availableHeight = Math.max(carcassHeight - frontReveal * 2 - gap * (drawerCount - 1), carcassHeight / 3);
  const drawerHeight = availableHeight / drawerCount;
  const drawerWidth = Math.max(width - frontReveal * 2, frontThickness);
  const parts = [];

  for (let index = 0; index < drawerCount; index += 1) {
    const centerY =
      shellBottom + carcassHeight - frontReveal - drawerHeight / 2 - index * (drawerHeight + gap);

    parts.push({
      key: `drawer-front-${index + 1}`,
      position: [0, centerY, depth / 2 - frontThickness / 2],
      args: [drawerWidth, drawerHeight, frontThickness],
      tone: "front",
    });

    const handlePart = getHandlePart({
      key: `drawer-handle-${index + 1}`,
      centerX: 0,
      centerY,
      panelWidth: drawerWidth,
      panelHeight: drawerHeight,
      depth,
      handle: model.front?.handle,
      isHorizontal: true,
    });

    if (handlePart) {
      parts.push(handlePart);
    }
  }

  return parts;
};

const getFrontParts = (metrics) => {
  if (!metrics.model.front || metrics.model.front.hasFacade === false) {
    return [];
  }

  if (metrics.model.front.type === "drawers") {
    return getDrawerFrontParts(metrics);
  }

  return getDoubleDoorFrontParts(metrics);
};

const getLegParts = (metrics) => {
  const { model, width, height, depth, legHeight, legInset, legWidth, legDepth } = metrics;

  if (model.legs?.enabled !== true || legHeight <= 0) {
    return [];
  }

  const legX = Math.max(width / 2 - legInset - legWidth / 2, legWidth / 2);
  const legZ = Math.max(depth / 2 - legInset - legDepth / 2, legDepth / 2);
  const centerY = -height / 2 + legHeight / 2;

  return [
    {
      key: "leg-front-left",
      position: [-legX, centerY, legZ],
      args: [legWidth, legHeight, legDepth],
      tone: "leg",
    },
    {
      key: "leg-front-right",
      position: [legX, centerY, legZ],
      args: [legWidth, legHeight, legDepth],
      tone: "leg",
    },
    {
      key: "leg-back-left",
      position: [-legX, centerY, -legZ],
      args: [legWidth, legHeight, legDepth],
      tone: "leg",
    },
    {
      key: "leg-back-right",
      position: [legX, centerY, -legZ],
      args: [legWidth, legHeight, legDepth],
      tone: "leg",
    },
  ];
};

export const KitchenCabinetModel = ({ size, category, model, isGhost = false, isMoving = false, isSelected = false }) => {
  const theme = getCabinetTheme({ isGhost, isMoving, isSelected });
  const metrics = getCabinetMetrics(size, category, model);
  const parts = [
    ...getCabinetBodyParts(metrics),
    ...getShelfParts(metrics),
    ...getFrontParts(metrics),
    ...getLegParts(metrics),
  ];

  return (
    <>
      {parts.map((part) => (
        <BoxPart
          key={part.key}
          position={part.position}
          args={part.args}
          materialProps={getPanelMaterialProps(theme, part.tone)}
        />
      ))}
    </>
  );
};

export default KitchenCabinetModel;
