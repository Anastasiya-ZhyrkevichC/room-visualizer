import { getCupboardFootprint } from "./geometry";

export const CABINET_GAP = 0.08;
export const BACK_WALL_ID = "back";

const createPosition = (x, y, z) => ({ x, y, z });
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getBottomRight = (cupboard) => {
  const footprint = getCupboardFootprint(cupboard.size, cupboard.rotation);

  return createPosition(
    cupboard.position.x + footprint.width / 2,
    cupboard.position.y - cupboard.size[1] / 2,
    cupboard.position.z - footprint.depth / 2,
  );
};

export const createCupboard = ({ id, cabinet, position, rotation = 0, wall = BACK_WALL_ID }) => ({
  id,
  catalogId: cabinet.catalogId ?? cabinet.id,
  name: cabinet.name,
  description: cabinet.description,
  dimensionsMm: cabinet.dimensionsMm,
  size: cabinet.size,
  position,
  rotation,
  wall,
});

export const createInitialCupboardPosition = (size, roomBounds) => {
  const footprint = getCupboardFootprint(size, 0);

  return createPosition(0, roomBounds.floor + size[1] / 2, roomBounds.back + footprint.depth / 2);
};

export const getFloorAlignedPreviewPosition = (size, point, roomBounds, rotation = 0) => {
  const footprint = getCupboardFootprint(size, rotation);

  return createPosition(
    clamp(point.x, roomBounds.left + footprint.width / 2, roomBounds.right - footprint.width / 2),
    roomBounds.floor + size[1] / 2,
    clamp(point.z, roomBounds.back + footprint.depth / 2, roomBounds.front - footprint.depth / 2),
  );
};

export const getBackWallAlignedPreviewPosition = (size, point, roomBounds, rotation = 0) => {
  const footprint = getCupboardFootprint(size, rotation);

  return createPosition(
    clamp(point.x, roomBounds.left + footprint.width / 2, roomBounds.right - footprint.width / 2),
    roomBounds.floor + size[1] / 2,
    roomBounds.back + footprint.depth / 2,
  );
};

export const createPlacementPreview = (cabinet, roomBounds) => ({
  catalogId: cabinet.id,
  name: cabinet.name,
  description: cabinet.description,
  dimensionsMm: cabinet.dimensionsMm,
  size: cabinet.size,
  rotation: 0,
  wall: null,
  isValid: false,
  position: getBackWallAlignedPreviewPosition(cabinet.size, { x: 0 }, roomBounds),
});

export const getAttachedCupboardPosition = (lastCupboard, nextSize) => {
  const nextFootprint = getCupboardFootprint(nextSize, 0);
  const anchorPoint = getBottomRight(lastCupboard);

  return createPosition(
    anchorPoint.x + nextFootprint.width / 2 + CABINET_GAP,
    anchorPoint.y + nextSize[1] / 2,
    anchorPoint.z + nextFootprint.depth / 2,
  );
};

export const alignCupboardToBackWall = (cupboard, rotation, roomBounds) => {
  const footprint = getCupboardFootprint(cupboard.size, rotation);

  return {
    ...cupboard.position,
    z: roomBounds.back + footprint.depth / 2,
  };
};
