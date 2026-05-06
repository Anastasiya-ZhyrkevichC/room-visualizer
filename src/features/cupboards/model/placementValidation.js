import { getCupboardFootprint } from "./geometry";
import {
  CUPBOARD_RESIZE_SIDES,
  MAGNETIC_ATTACHMENT_EDGES,
  PLACEMENT_VALIDATION_REASONS,
  SAME_WALL_MAGNETIC_TOLERANCE,
} from "./placementConstants";
import { createPlacementValidationResult } from "./placementFactories";
import { getCupboardWallSpan, getWallSpanCenter, getWallSpanLength, setWallSpanCenter } from "./wallSpan";
import { getCabinetWallAlignedPreviewPosition, getWallAlignedRotation, isPlacementWall } from "./wallAlignment";
import { BACK_WALL_ID, LEFT_WALL_ID, RIGHT_WALL_ID } from "./walls";

export { getCupboardWallSpan, getWallSpanCenter, getWallSpanLength, setWallSpanCenter } from "./wallSpan";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const OVERLAP_EPSILON = 1e-6;

export const getWallSpanEdgeForResizeSide = (wall, side) => {
  switch (wall) {
    case LEFT_WALL_ID:
      return side === CUPBOARD_RESIZE_SIDES.LEFT
        ? MAGNETIC_ATTACHMENT_EDGES.END
        : side === CUPBOARD_RESIZE_SIDES.RIGHT
          ? MAGNETIC_ATTACHMENT_EDGES.START
          : null;
    case RIGHT_WALL_ID:
    case BACK_WALL_ID:
    default:
      return side === CUPBOARD_RESIZE_SIDES.LEFT
        ? MAGNETIC_ATTACHMENT_EDGES.START
        : side === CUPBOARD_RESIZE_SIDES.RIGHT
          ? MAGNETIC_ATTACHMENT_EDGES.END
          : null;
  }
};

export const getOppositeWallSpanEdge = (edge) =>
  edge === MAGNETIC_ATTACHMENT_EDGES.START
    ? MAGNETIC_ATTACHMENT_EDGES.END
    : edge === MAGNETIC_ATTACHMENT_EDGES.END
      ? MAGNETIC_ATTACHMENT_EDGES.START
      : null;


const getWallSpanLimits = (roomBounds, wall) => {
  switch (wall) {
    case LEFT_WALL_ID:
    case RIGHT_WALL_ID:
      return {
        min: roomBounds.back,
        max: roomBounds.front,
      };
    case BACK_WALL_ID:
    default:
      return {
        min: roomBounds.left,
        max: roomBounds.right,
      };
  }
};

const getWallAlignedSpanRange = ({ size, rotation, roomBounds, wall }) => {
  const footprint = getCupboardFootprint(size, rotation);
  const spanLength = getWallSpanLength(footprint, wall);
  const wallSpanLimits = getWallSpanLimits(roomBounds, wall);

  return {
    spanLength,
    minCenter: wallSpanLimits.min + spanLength / 2,
    maxCenter: wallSpanLimits.max - spanLength / 2,
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

const boxesOverlapVertically = (firstBox, secondBox) =>
  firstBox.minY < secondBox.maxY - OVERLAP_EPSILON && firstBox.maxY > secondBox.minY + OVERLAP_EPSILON;

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

export const getSameWallCollisionIds = ({ candidate, cupboards, snappedPosition, rotation, wall }) => {
  if (!Array.isArray(cupboards) || cupboards.length === 0) {
    return [];
  }

  const candidateSpan = getCupboardWallSpan({
    ...candidate,
    position: snappedPosition,
    rotation,
    wall,
  });
  const candidateBounds = getCupboardBounds({
    ...candidate,
    position: snappedPosition,
    rotation,
  });

  return cupboards
    .filter((cupboard) => cupboard.wall === wall && cupboard.id !== candidate.id)
    .filter((cupboard) => {
      if (!spansOverlap(candidateSpan, getCupboardWallSpan(cupboard))) {
        return false;
      }

      return boxesIntersect(candidateBounds, getCupboardBounds(cupboard));
    })
    .map((cupboard) => cupboard.id);
};

const getSameWallBlockedIntervals = ({ candidate, cupboards, roomBounds, snappedPosition, rotation, wall }) => {
  if (!Array.isArray(cupboards) || cupboards.length === 0) {
    return [];
  }

  const { spanLength, minCenter, maxCenter } = getWallAlignedSpanRange({
    size: candidate.size,
    rotation,
    roomBounds,
    wall,
  });
  const candidateBounds = getCupboardBounds({
    ...candidate,
    position: snappedPosition,
    rotation,
  });

  return cupboards
    .filter((cupboard) => cupboard.wall === wall && cupboard.id !== candidate.id)
    .filter((cupboard) => boxesOverlapVertically(candidateBounds, getCupboardBounds(cupboard)))
    .map((cupboard) => {
      const span = getCupboardWallSpan(cupboard);

      return {
        start: span.start - spanLength / 2,
        end: span.end + spanLength / 2,
        leftAttachment: {
          cupboardId: cupboard.id,
          edge: MAGNETIC_ATTACHMENT_EDGES.START,
        },
        rightAttachment: {
          cupboardId: cupboard.id,
          edge: MAGNETIC_ATTACHMENT_EDGES.END,
        },
      };
    })
    .filter((interval) => interval.end > minCenter + OVERLAP_EPSILON && interval.start < maxCenter - OVERLAP_EPSILON)
    .sort((firstInterval, secondInterval) => firstInterval.start - secondInterval.start)
    .reduce((mergedIntervals, interval) => {
      const currentInterval = mergedIntervals[mergedIntervals.length - 1];

      if (!currentInterval || interval.start >= currentInterval.end - OVERLAP_EPSILON) {
        mergedIntervals.push(interval);
        return mergedIntervals;
      }

      if (interval.end > currentInterval.end) {
        currentInterval.end = interval.end;
        currentInterval.rightAttachment = interval.rightAttachment;
      }

      return mergedIntervals;
    }, []);
};

const getNearestMagneticSnapOption = ({
  blockedInterval,
  candidate,
  rawSnappedPosition,
  roomBounds,
  rotation,
  wall,
}) => {
  if (!blockedInterval) {
    return null;
  }

  const rawSpanCenter = getWallSpanCenter(rawSnappedPosition, wall);
  const previousSpanCenter = candidate.position ? getWallSpanCenter(candidate.position, wall) : rawSpanCenter;
  const { minCenter, maxCenter } = getWallAlignedSpanRange({
    size: candidate.size,
    rotation,
    roomBounds,
    wall,
  });
  const snapOptions = [];

  if (blockedInterval.start >= minCenter - OVERLAP_EPSILON) {
    snapOptions.push({
      center: clamp(blockedInterval.start, minCenter, maxCenter),
      intrusionDistance: rawSpanCenter - blockedInterval.start,
      attachment: {
        ...blockedInterval.leftAttachment,
        intrusionDistance: rawSpanCenter - blockedInterval.start,
      },
    });
  }

  if (blockedInterval.end <= maxCenter + OVERLAP_EPSILON) {
    snapOptions.push({
      center: clamp(blockedInterval.end, minCenter, maxCenter),
      intrusionDistance: blockedInterval.end - rawSpanCenter,
      attachment: {
        ...blockedInterval.rightAttachment,
        intrusionDistance: blockedInterval.end - rawSpanCenter,
      },
    });
  }

  if (snapOptions.length === 0) {
    return null;
  }

  return snapOptions.sort((firstOption, secondOption) => {
    if (Math.abs(firstOption.intrusionDistance - secondOption.intrusionDistance) > OVERLAP_EPSILON) {
      return firstOption.intrusionDistance - secondOption.intrusionDistance;
    }

    const firstDistanceFromPrevious = Math.abs(firstOption.center - previousSpanCenter);
    const secondDistanceFromPrevious = Math.abs(secondOption.center - previousSpanCenter);

    if (Math.abs(firstDistanceFromPrevious - secondDistanceFromPrevious) > OVERLAP_EPSILON) {
      return firstDistanceFromPrevious - secondDistanceFromPrevious;
    }

    return firstOption.center - secondOption.center;
  })[0];
};

const getSameWallPlacementOutcome = ({ candidate, cupboards, rawSnappedPosition, roomBounds, rotation, wall }) => {
  const sameWallCollisionIds = getSameWallCollisionIds({
    candidate,
    cupboards,
    snappedPosition: rawSnappedPosition,
    rotation,
    wall,
  });

  if (sameWallCollisionIds.length === 0) {
    return {
      isValid: true,
      snappedPosition: rawSnappedPosition,
      collidingCupboardIds: [],
      isMagneticallySnapped: false,
      magneticAttachment: null,
    };
  }

  const rawSpanCenter = getWallSpanCenter(rawSnappedPosition, wall);
  const blockedInterval = getSameWallBlockedIntervals({
    candidate,
    cupboards,
    roomBounds,
    snappedPosition: rawSnappedPosition,
    rotation,
    wall,
  }).find(
    (interval) => rawSpanCenter > interval.start + OVERLAP_EPSILON && rawSpanCenter < interval.end - OVERLAP_EPSILON,
  );
  const magneticSnapOption = getNearestMagneticSnapOption({
    blockedInterval,
    candidate,
    rawSnappedPosition,
    roomBounds,
    rotation,
    wall,
  });

  if (!magneticSnapOption || magneticSnapOption.intrusionDistance > SAME_WALL_MAGNETIC_TOLERANCE + OVERLAP_EPSILON) {
    return {
      isValid: false,
      snappedPosition: rawSnappedPosition,
      collidingCupboardIds: sameWallCollisionIds,
      isMagneticallySnapped: false,
      magneticAttachment: null,
    };
  }

  return {
    isValid: true,
    snappedPosition: setWallSpanCenter(rawSnappedPosition, wall, magneticSnapOption.center),
    collidingCupboardIds: [],
    isMagneticallySnapped: true,
    magneticAttachment: magneticSnapOption.attachment,
  };
};

export const getCornerCollisionIds = ({ candidate, cupboards, snappedPosition, rotation, wall }) => {
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
  const rawSnappedPosition = getCabinetWallAlignedPreviewPosition(candidate, point, roomBounds, wall, rotation);
  const sameWallPlacementOutcome = getSameWallPlacementOutcome({
    candidate,
    cupboards,
    rawSnappedPosition,
    roomBounds,
    rotation,
    wall,
  });
  const cornerCollisionIds = getCornerCollisionIds({
    candidate,
    cupboards,
    snappedPosition: sameWallPlacementOutcome.snappedPosition,
    rotation,
    wall,
  });
  const collidingCupboardIds = [...new Set([...sameWallPlacementOutcome.collidingCupboardIds, ...cornerCollisionIds])];
  const reason = !sameWallPlacementOutcome.isValid
    ? PLACEMENT_VALIDATION_REASONS.OVERLAP
    : cornerCollisionIds.length > 0
      ? PLACEMENT_VALIDATION_REASONS.CORNER_COLLISION
      : null;

  return createPlacementValidationResult({
    isValid: sameWallPlacementOutcome.isValid && cornerCollisionIds.length === 0,
    reason,
    wall,
    rotation,
    snappedPosition: sameWallPlacementOutcome.snappedPosition,
    rawSnappedPosition,
    collidingCupboardIds,
    isMagneticallySnapped: sameWallPlacementOutcome.isMagneticallySnapped,
    magneticAttachment: sameWallPlacementOutcome.magneticAttachment,
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
    case PLACEMENT_VALIDATION_REASONS.WALL_BOUNDS:
      return "Extends past the wall bounds";
    default:
      return null;
  }
};
