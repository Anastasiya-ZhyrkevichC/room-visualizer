import { getCupboardFootprint } from "./geometry";
import { getStarterCabinet, resolveStarterCabinetInstance, resolveStarterCabinetWidthStep } from "./catalog";
import { BACK_WALL_ID, LEFT_WALL_ID, RIGHT_WALL_ID } from "./walls";

export const CABINET_GAP = 0.08;
export { BACK_WALL_ID, LEFT_WALL_ID, RIGHT_WALL_ID } from "./walls";
export const CUPBOARD_RESIZE_SIDES = {
  LEFT: "left",
  RIGHT: "right",
};
export const SAME_WALL_MAGNETIC_TOLERANCE = 0.12;
export const PLACEMENT_VALIDATION_REASONS = {
  UNSUPPORTED_WALL: "unsupported-wall",
  OVERLAP: "overlap",
  ADJACENCY_GAP: "adjacency-gap",
  CORNER_COLLISION: "corner-collision",
  WALL_BOUNDS: "wall-bounds",
};
export const MAGNETIC_ATTACHMENT_EDGES = {
  START: "start",
  END: "end",
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
  ...resolveStarterCabinetInstance(cabinet, {
    variantId: cabinet?.activeVariantId ?? null,
  }),
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
  rawSnappedPosition = snappedPosition,
  collidingCupboardIds = [],
  isMagneticallySnapped = false,
  magneticAttachment = null,
} = {}) => ({
  isValid,
  reason,
  wall,
  rotation,
  snappedPosition: clonePosition(snappedPosition),
  rawSnappedPosition: clonePosition(rawSnappedPosition),
  collidingCupboardIds,
  isMagneticallySnapped,
  magneticAttachment: magneticAttachment ? { ...magneticAttachment } : null,
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

const getWallSpanEdgeForResizeSide = (wall, side) => {
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

const getOppositeWallSpanEdge = (edge) =>
  edge === MAGNETIC_ATTACHMENT_EDGES.START
    ? MAGNETIC_ATTACHMENT_EDGES.END
    : edge === MAGNETIC_ATTACHMENT_EDGES.END
      ? MAGNETIC_ATTACHMENT_EDGES.START
      : null;

const setWallSpanCenter = (position, wall, spanCenter) => {
  if (!position) {
    return position;
  }

  switch (wall) {
    case LEFT_WALL_ID:
    case RIGHT_WALL_ID:
      return {
        ...position,
        z: spanCenter,
      };
    case BACK_WALL_ID:
    default:
      return {
        ...position,
        x: spanCenter,
      };
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

const getAnchoredResizePosition = ({
  cupboard,
  resizedCabinet,
  roomBounds,
  wall,
  anchoredSpanEdge,
  anchoredSpanValue,
}) => {
  const rotation = getWallAlignedRotation(wall);
  const footprint = getCupboardFootprint(resizedCabinet.size, rotation);
  const spanLength = getWallSpanLength(footprint, wall);
  const anchoredPosition = alignCupboardToWall(
    {
      ...cupboard,
      size: resizedCabinet.size,
    },
    rotation,
    roomBounds,
    wall,
  );
  const spanCenter =
    anchoredSpanEdge === MAGNETIC_ATTACHMENT_EDGES.START
      ? anchoredSpanValue + spanLength / 2
      : anchoredSpanValue - spanLength / 2;

  return setWallSpanCenter(anchoredPosition, wall, spanCenter);
};

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

const getSameWallBlockedIntervals = ({ candidate, cupboards, roomBounds, rotation, wall }) => {
  if (!Array.isArray(cupboards) || cupboards.length === 0) {
    return [];
  }

  const { spanLength, minCenter, maxCenter } = getWallAlignedSpanRange({
    size: candidate.size,
    rotation,
    roomBounds,
    wall,
  });

  return cupboards
    .filter((cupboard) => cupboard.wall === wall && cupboard.id !== candidate.id)
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
  const rawSnappedPosition = getWallAlignedPreviewPosition(candidate.size, point, roomBounds, wall, rotation);
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

export const createPlacementPreview = (cabinet, roomBounds) => {
  const resolvedCabinet =
    resolveStarterCabinetInstance(cabinet, {
      useDefaultVariant: true,
    }) ?? cabinet;
  const initialRotation = getWallAlignedRotation(BACK_WALL_ID);
  const initialPosition = getWallAlignedPreviewPosition(resolvedCabinet.size, { x: 0 }, roomBounds, BACK_WALL_ID);

  return {
    ...resolvedCabinet,
    rotation: initialRotation,
    wall: null,
    position: initialPosition,
    validation: createPlacementValidationResult({
      isValid: false,
      reason: PLACEMENT_VALIDATION_REASONS.UNSUPPORTED_WALL,
      wall: null,
      rotation: initialRotation,
      snappedPosition: initialPosition,
    }),
  };
};

const getResizableWidthVariants = (cupboard) => {
  const definitionId = cupboard?.catalogId ?? cupboard?.id ?? null;

  if (!definitionId) {
    return [];
  }

  const sourceDefinition = getStarterCabinet(definitionId);
  const resolvedInstance = resolveStarterCabinetInstance(cupboard);

  if (!sourceDefinition || sourceDefinition.id !== definitionId || !resolvedInstance) {
    return [];
  }

  return sourceDefinition.variants
    .filter((variant) => variant.height === resolvedInstance.height && variant.depth === resolvedInstance.depth)
    .map((variant) => resolveStarterCabinetInstance(cupboard, { variantId: variant.id }))
    .filter(Boolean);
};

const getNearestResizableWidthVariant = ({ cupboard, desiredSpanLength }) => {
  const resolvedInstance = resolveStarterCabinetInstance(cupboard);
  const widthVariants = getResizableWidthVariants(cupboard);

  if (!resolvedInstance || widthVariants.length === 0 || !Number.isFinite(desiredSpanLength)) {
    return null;
  }

  const clampedDesiredSpanLength = Math.max(0, desiredSpanLength);
  const currentWidth = resolvedInstance.size?.[0] ?? resolvedInstance.width / 1000;
  const preferredDirection = Math.sign(clampedDesiredSpanLength - currentWidth);

  return widthVariants.reduce((bestVariant, variant) => {
    if (!bestVariant) {
      return variant;
    }

    const variantDistance = Math.abs(variant.size[0] - clampedDesiredSpanLength);
    const bestVariantDistance = Math.abs(bestVariant.size[0] - clampedDesiredSpanLength);

    if (Math.abs(variantDistance - bestVariantDistance) > OVERLAP_EPSILON) {
      return variantDistance < bestVariantDistance ? variant : bestVariant;
    }

    if (preferredDirection !== 0) {
      const variantDirection = Math.sign(variant.size[0] - currentWidth);
      const bestVariantDirection = Math.sign(bestVariant.size[0] - currentWidth);
      const variantMatchesDirection = variantDirection === preferredDirection;
      const bestVariantMatchesDirection = bestVariantDirection === preferredDirection;

      if (variantMatchesDirection !== bestVariantMatchesDirection) {
        return variantMatchesDirection ? variant : bestVariant;
      }
    }

    const variantCurrentDistance = Math.abs(variant.size[0] - currentWidth);
    const bestVariantCurrentDistance = Math.abs(bestVariant.size[0] - currentWidth);

    if (Math.abs(variantCurrentDistance - bestVariantCurrentDistance) > OVERLAP_EPSILON) {
      return variantCurrentDistance < bestVariantCurrentDistance ? variant : bestVariant;
    }

    return variant.size[0] < bestVariant.size[0] ? variant : bestVariant;
  }, null);
};

const createUnavailableResizeOutcome = () => ({
  cupboard: null,
  validation: null,
  isAvailable: false,
});

const createAnchoredResizeValidation = ({
  candidate,
  cupboards,
  roomBounds,
  wall,
  anchoredPosition,
  anchoredSpanEdge,
  anchoredSpanValue,
}) => {
  const baseValidation = validatePlacementCandidate({
    candidate,
    point: anchoredPosition,
    roomBounds,
    wall,
    cupboards,
  });
  const resolvedRotation = baseValidation?.rotation ?? candidate.rotation;
  const resolvedWall = baseValidation?.wall ?? wall;
  const validatedSpan = getCupboardWallSpan({
    ...candidate,
    position: baseValidation?.snappedPosition ?? anchoredPosition,
    rotation: resolvedRotation,
    wall: resolvedWall,
  });
  const keepsAnchoredEdge =
    Number.isFinite(anchoredSpanValue) &&
    Number.isFinite(validatedSpan?.[anchoredSpanEdge]) &&
    Math.abs(validatedSpan[anchoredSpanEdge] - anchoredSpanValue) <= OVERLAP_EPSILON;
  const sameWallCollisionIds = getSameWallCollisionIds({
    candidate,
    cupboards,
    snappedPosition: anchoredPosition,
    rotation: resolvedRotation,
    wall,
  });
  const cornerCollisionIds = getCornerCollisionIds({
    candidate,
    cupboards,
    snappedPosition: anchoredPosition,
    rotation: resolvedRotation,
    wall,
  });
  const collidingCupboardIds = [...new Set([...sameWallCollisionIds, ...cornerCollisionIds])];
  const isValid = Boolean(baseValidation?.isValid && keepsAnchoredEdge && collidingCupboardIds.length === 0);
  const reason = isValid
    ? null
    : cornerCollisionIds.length > 0
      ? PLACEMENT_VALIDATION_REASONS.CORNER_COLLISION
      : collidingCupboardIds.length > 0
        ? PLACEMENT_VALIDATION_REASONS.OVERLAP
        : PLACEMENT_VALIDATION_REASONS.WALL_BOUNDS;

  return createPlacementValidationResult({
    isValid,
    reason,
    wall,
    rotation: resolvedRotation,
    snappedPosition: anchoredPosition,
    rawSnappedPosition: anchoredPosition,
    collidingCupboardIds,
    isMagneticallySnapped: false,
    magneticAttachment: null,
  });
};

const getEdgeAnchoredResizeOutcome = ({ cupboard, resizedCabinet, side, roomBounds, cupboards = [] }) => {
  if (!cupboard || !resizedCabinet || !isPlacementWall(cupboard.wall)) {
    return createUnavailableResizeOutcome();
  }

  const movingSpanEdge = getWallSpanEdgeForResizeSide(cupboard.wall, side);
  const anchoredSpanEdge = getOppositeWallSpanEdge(movingSpanEdge);

  if (!movingSpanEdge || !anchoredSpanEdge) {
    return createUnavailableResizeOutcome();
  }

  const currentSpan = getCupboardWallSpan(cupboard);
  const anchoredSpanValue = currentSpan[anchoredSpanEdge];
  const anchoredPosition = getAnchoredResizePosition({
    cupboard,
    resizedCabinet,
    roomBounds,
    wall: cupboard.wall,
    anchoredSpanEdge,
    anchoredSpanValue,
  });
  const resizedCandidate = {
    ...cupboard,
    ...resizedCabinet,
    position: anchoredPosition,
    rotation: getWallAlignedRotation(cupboard.wall),
    wall: cupboard.wall,
  };
  const validation = createAnchoredResizeValidation({
    candidate: resizedCandidate,
    cupboards,
    roomBounds,
    wall: cupboard.wall,
    anchoredPosition,
    anchoredSpanEdge,
    anchoredSpanValue,
  });

  return {
    cupboard: {
      ...resizedCandidate,
      position: validation?.snappedPosition ?? anchoredPosition,
      rotation: validation?.rotation ?? resizedCandidate.rotation,
      wall: validation?.wall ?? resizedCandidate.wall,
    },
    validation,
    isAvailable: Boolean(validation?.isValid),
  };
};

export const getCupboardResizeDragOutcome = ({ cupboard, point, side, roomBounds, cupboards = [] }) => {
  if (!cupboard || !point || !isPlacementWall(cupboard.wall)) {
    return createUnavailableResizeOutcome();
  }

  const movingSpanEdge = getWallSpanEdgeForResizeSide(cupboard.wall, side);
  const anchoredSpanEdge = getOppositeWallSpanEdge(movingSpanEdge);

  if (!movingSpanEdge || !anchoredSpanEdge) {
    return createUnavailableResizeOutcome();
  }

  const currentSpan = getCupboardWallSpan(cupboard);
  const anchoredSpanValue = currentSpan[anchoredSpanEdge];
  const pointerSpanValue = getWallSpanCenter(point, cupboard.wall);
  const desiredSpanLength =
    movingSpanEdge === MAGNETIC_ATTACHMENT_EDGES.START
      ? anchoredSpanValue - pointerSpanValue
      : pointerSpanValue - anchoredSpanValue;
  const resizedCabinet = getNearestResizableWidthVariant({
    cupboard,
    desiredSpanLength,
  });

  return resizedCabinet
    ? getEdgeAnchoredResizeOutcome({
        cupboard,
        resizedCabinet,
        side,
        roomBounds,
        cupboards,
      })
    : createUnavailableResizeOutcome();
};

export const getCupboardWidthStepOutcome = ({
  cupboard,
  direction,
  side = direction === "previous" ? CUPBOARD_RESIZE_SIDES.LEFT : CUPBOARD_RESIZE_SIDES.RIGHT,
  roomBounds,
  cupboards = [],
}) => {
  const resizedCabinet = resolveStarterCabinetWidthStep(cupboard, direction);

  if (!resizedCabinet) {
    return createUnavailableResizeOutcome();
  }

  return getEdgeAnchoredResizeOutcome({
    cupboard,
    resizedCabinet,
    side,
    roomBounds,
    cupboards,
  });
};

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
