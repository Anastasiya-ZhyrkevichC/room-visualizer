import { getCupboardFootprint } from "./geometry";

export const CABINET_GAP = 0.08;
export const BACK_WALL_ID = "back";
export const LEFT_WALL_ID = "left";
export const RIGHT_WALL_ID = "right";
export const PLACEMENT_VALIDATION_REASONS = {
  UNSUPPORTED_WALL: "unsupported-wall",
  OVERLAP: "overlap",
  ADJACENCY_GAP: "adjacency-gap",
  CORNER_COLLISION: "corner-collision",
};

const createPosition = (x, y, z) => ({ x, y, z });
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const clonePosition = (position) => (position ? { ...position } : position);
const OVERLAP_EPSILON = 1e-6;

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
  model: cabinet.model,
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

export const createPlacementValidationResult = ({
  isValid = false,
  reason = null,
  wall = null,
  rotation = 0,
  snappedPosition = null,
  collidingCupboardIds = [],
} = {}) => ({
  isValid,
  reason,
  wall,
  rotation,
  snappedPosition: clonePosition(snappedPosition),
  collidingCupboardIds,
});

const getWallSpanCenter = (position, wall) => {
  switch (wall) {
    case LEFT_WALL_ID:
    case RIGHT_WALL_ID:
      return position.z;
    case BACK_WALL_ID:
    default:
      return position.x;
  }
};

const getWallSpanLength = (footprint, wall) => {
  switch (wall) {
    case LEFT_WALL_ID:
    case RIGHT_WALL_ID:
      return footprint.depth;
    case BACK_WALL_ID:
    default:
      return footprint.width;
  }
};

const getCupboardWallSpan = ({ size, rotation, position, wall }) => {
  const footprint = getCupboardFootprint(size, rotation);
  const spanCenter = getWallSpanCenter(position, wall);
  const spanLength = getWallSpanLength(footprint, wall);

  return {
    start: spanCenter - spanLength / 2,
    end: spanCenter + spanLength / 2,
  };
};

const spansOverlap = (firstSpan, secondSpan) =>
  firstSpan.start < secondSpan.end - OVERLAP_EPSILON && firstSpan.end > secondSpan.start + OVERLAP_EPSILON;

const getCupboardBounds = ({ size, rotation, position }) => {
  const footprint = getCupboardFootprint(size, rotation);

  return {
    minX: position.x - footprint.width / 2,
    maxX: position.x + footprint.width / 2,
    minY: position.y - size[1] / 2,
    maxY: position.y + size[1] / 2,
    minZ: position.z - footprint.depth / 2,
    maxZ: position.z + footprint.depth / 2,
  };
};

const boxesIntersect = (firstBox, secondBox) =>
  firstBox.minX < secondBox.maxX - OVERLAP_EPSILON &&
  firstBox.maxX > secondBox.minX + OVERLAP_EPSILON &&
  firstBox.minY < secondBox.maxY - OVERLAP_EPSILON &&
  firstBox.maxY > secondBox.minY + OVERLAP_EPSILON &&
  firstBox.minZ < secondBox.maxZ - OVERLAP_EPSILON &&
  firstBox.maxZ > secondBox.minZ + OVERLAP_EPSILON;

const getAdjacentWalls = (wall) => {
  switch (wall) {
    case LEFT_WALL_ID:
    case RIGHT_WALL_ID:
      return [BACK_WALL_ID];
    case BACK_WALL_ID:
      return [LEFT_WALL_ID, RIGHT_WALL_ID];
    default:
      return [];
  }
};

const getSameWallCollisionIds = ({ candidate, cupboards, snappedPosition, rotation, wall }) => {
  if (!Array.isArray(cupboards) || cupboards.length === 0) {
    return [];
  }

  const candidateSpan = getCupboardWallSpan({
    ...candidate,
    position: snappedPosition,
    rotation,
    wall,
  });

  return cupboards
    .filter((cupboard) => cupboard.wall === wall && cupboard.id !== candidate.id)
    .filter((cupboard) => spansOverlap(candidateSpan, getCupboardWallSpan(cupboard)))
    .map((cupboard) => cupboard.id);
};

const getCornerCollisionIds = ({ candidate, cupboards, snappedPosition, rotation, wall }) => {
  if (!Array.isArray(cupboards) || cupboards.length === 0) {
    return [];
  }

  const adjacentWalls = getAdjacentWalls(wall);

  if (adjacentWalls.length === 0) {
    return [];
  }

  const candidateBounds = getCupboardBounds({
    ...candidate,
    position: snappedPosition,
    rotation,
  });

  return cupboards
    .filter((cupboard) => adjacentWalls.includes(cupboard.wall) && cupboard.id !== candidate.id)
    .filter((cupboard) => boxesIntersect(candidateBounds, getCupboardBounds(cupboard)))
    .map((cupboard) => cupboard.id);
};

export const validatePlacementCandidate = ({ candidate, point, roomBounds, wall, cupboards = [] }) => {
  if (!isPlacementWall(wall) || !point) {
    return createPlacementValidationResult({
      isValid: false,
      reason: PLACEMENT_VALIDATION_REASONS.UNSUPPORTED_WALL,
      wall: null,
      rotation: candidate.rotation ?? getWallAlignedRotation(BACK_WALL_ID),
      snappedPosition: candidate.position,
    });
  }

  const rotation = getWallAlignedRotation(wall);
  const snappedPosition = getWallAlignedPreviewPosition(candidate.size, point, roomBounds, wall, rotation);
  const sameWallCollisionIds = getSameWallCollisionIds({
    candidate,
    cupboards,
    snappedPosition,
    rotation,
    wall,
  });
  const cornerCollisionIds = getCornerCollisionIds({
    candidate,
    cupboards,
    snappedPosition,
    rotation,
    wall,
  });
  const collidingCupboardIds = [...new Set([...sameWallCollisionIds, ...cornerCollisionIds])];
  const reason =
    sameWallCollisionIds.length > 0
      ? PLACEMENT_VALIDATION_REASONS.OVERLAP
      : cornerCollisionIds.length > 0
        ? PLACEMENT_VALIDATION_REASONS.CORNER_COLLISION
        : null;

  return createPlacementValidationResult({
    isValid: collidingCupboardIds.length === 0,
    reason,
    wall,
    rotation,
    snappedPosition,
    collidingCupboardIds,
  });
};

export const getPlacementValidationReasonLabel = (reason) => {
  switch (reason) {
    case PLACEMENT_VALIDATION_REASONS.OVERLAP:
      return "Overlaps another cabinet";
    case PLACEMENT_VALIDATION_REASONS.ADJACENCY_GAP:
      return "Leave no gap between cabinets";
    case PLACEMENT_VALIDATION_REASONS.CORNER_COLLISION:
      return "Intersects a cabinet near the corner";
    default:
      return null;
  }
};

export const createPlacementPreview = (cabinet, roomBounds) => ({
  catalogId: cabinet.id,
  name: cabinet.name,
  category: cabinet.category,
  model: cabinet.model,
  width: cabinet.width,
  height: cabinet.height,
  depth: cabinet.depth,
  price: cabinet.price,
  size: cabinet.size,
  rotation: getWallAlignedRotation(BACK_WALL_ID),
  wall: null,
  position: getWallAlignedPreviewPosition(cabinet.size, { x: 0 }, roomBounds, BACK_WALL_ID),
  validation: createPlacementValidationResult({
    isValid: false,
    reason: PLACEMENT_VALIDATION_REASONS.UNSUPPORTED_WALL,
    wall: null,
    rotation: getWallAlignedRotation(BACK_WALL_ID),
    snappedPosition: getWallAlignedPreviewPosition(cabinet.size, { x: 0 }, roomBounds, BACK_WALL_ID),
  }),
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
