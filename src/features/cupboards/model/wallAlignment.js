import { convertMillimetersToMeters } from "../../../lib/units";
import { WALL_CABINET_BOTTOM_OFFSET_MM } from "./placementConstants";
import { getCupboardFootprint } from "./geometry";
import { BACK_WALL_ID, LEFT_WALL_ID, RIGHT_WALL_ID } from "./walls";

const createPosition = (x, y, z) => ({ x, y, z });
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const wallCabinetBottomOffset = convertMillimetersToMeters(WALL_CABINET_BOTTOM_OFFSET_MM);

export const getCabinetCenterY = ({ category, size, roomBounds }) =>
  roomBounds.floor + size[1] / 2 + (category === "wall" ? wallCabinetBottomOffset : 0);

export const getCabinetWallAlignedPreviewPosition = (
  cabinet,
  point,
  roomBounds,
  wall,
  rotation = getWallAlignedRotation(wall),
) => {
  const wallAlignedPosition = getWallAlignedPreviewPosition(cabinet.size, point, roomBounds, wall, rotation);

  return {
    ...wallAlignedPosition,
    y: getCabinetCenterY({
      category: cabinet.category,
      size: cabinet.size,
      roomBounds,
    }),
  };
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
