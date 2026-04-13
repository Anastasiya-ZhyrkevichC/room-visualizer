import { getCupboardFootprint } from "./geometry";

export const CABINET_GAP = 0.08;
export const BACK_WALL_ID = "back";
export const LEFT_WALL_ID = "left";
export const RIGHT_WALL_ID = "right";

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
  category: cabinet.category,
  width: cabinet.width,
  height: cabinet.height,
  depth: cabinet.depth,
  price: cabinet.price,
  size: cabinet.size,
  position,
  rotation,
  wall,
});

export const createInitialCupboardPosition = (size, roomBounds) => {
  const footprint = getCupboardFootprint(size, 0);

  return createPosition(0, roomBounds.floor + size[1] / 2, roomBounds.back + footprint.depth / 2);
};

export const isPlacementWall = (wall) => wall === BACK_WALL_ID || wall === LEFT_WALL_ID || wall === RIGHT_WALL_ID;

export const getWallAlignedRotation = (wall) => {
  switch (wall) {
    case LEFT_WALL_ID:
      return Math.PI / 2;
    case RIGHT_WALL_ID:
      return Math.PI * 1.5;
    case BACK_WALL_ID:
    default:
      return 0;
  }
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

export const getLeftWallAlignedPreviewPosition = (
  size,
  point,
  roomBounds,
  rotation = getWallAlignedRotation(LEFT_WALL_ID),
) => {
  const footprint = getCupboardFootprint(size, rotation);

  return createPosition(
    roomBounds.left + footprint.width / 2,
    roomBounds.floor + size[1] / 2,
    clamp(point.z, roomBounds.back + footprint.depth / 2, roomBounds.front - footprint.depth / 2),
  );
};

export const getRightWallAlignedPreviewPosition = (
  size,
  point,
  roomBounds,
  rotation = getWallAlignedRotation(RIGHT_WALL_ID),
) => {
  const footprint = getCupboardFootprint(size, rotation);

  return createPosition(
    roomBounds.right - footprint.width / 2,
    roomBounds.floor + size[1] / 2,
    clamp(point.z, roomBounds.back + footprint.depth / 2, roomBounds.front - footprint.depth / 2),
  );
};

export const getWallAlignedPreviewPosition = (
  size,
  point,
  roomBounds,
  wall,
  rotation = getWallAlignedRotation(wall),
) => {
  switch (wall) {
    case LEFT_WALL_ID:
      return getLeftWallAlignedPreviewPosition(size, point, roomBounds, rotation);
    case RIGHT_WALL_ID:
      return getRightWallAlignedPreviewPosition(size, point, roomBounds, rotation);
    case BACK_WALL_ID:
    default:
      return getBackWallAlignedPreviewPosition(size, point, roomBounds, rotation);
  }
};

export const createPlacementPreview = (cabinet, roomBounds) => ({
  catalogId: cabinet.id,
  name: cabinet.name,
  category: cabinet.category,
  width: cabinet.width,
  height: cabinet.height,
  depth: cabinet.depth,
  price: cabinet.price,
  size: cabinet.size,
  rotation: getWallAlignedRotation(BACK_WALL_ID),
  wall: null,
  isValid: false,
  position: getWallAlignedPreviewPosition(cabinet.size, { x: 0 }, roomBounds, BACK_WALL_ID),
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
  return alignCupboardToWall(cupboard, rotation, roomBounds, BACK_WALL_ID);
};

export const alignCupboardToWall = (cupboard, rotation, roomBounds, wall = BACK_WALL_ID) => {
  const footprint = getCupboardFootprint(cupboard.size, rotation);

  switch (wall) {
    case LEFT_WALL_ID:
      return {
        ...cupboard.position,
        x: roomBounds.left + footprint.width / 2,
      };
    case RIGHT_WALL_ID:
      return {
        ...cupboard.position,
        x: roomBounds.right - footprint.width / 2,
      };
    case BACK_WALL_ID:
    default:
      return {
        ...cupboard.position,
        z: roomBounds.back + footprint.depth / 2,
      };
  }
};
