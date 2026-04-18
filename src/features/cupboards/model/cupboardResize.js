import { getStarterCabinet, resolveStarterCabinetInstance, resolveStarterCabinetWidthStep } from "./catalog";
import { getCupboardFootprint } from "./geometry";
import { CUPBOARD_RESIZE_SIDES, MAGNETIC_ATTACHMENT_EDGES, PLACEMENT_VALIDATION_REASONS } from "./placementConstants";
import { createPlacementValidationResult } from "./placementFactories";
import {
  getCornerCollisionIds,
  getCupboardWallSpan,
  getOppositeWallSpanEdge,
  getSameWallCollisionIds,
  getWallSpanCenter,
  getWallSpanEdgeForResizeSide,
  getWallSpanLength,
  setWallSpanCenter,
  validatePlacementCandidate,
} from "./placementValidation";
import { alignCupboardToWall, getWallAlignedRotation, isPlacementWall } from "./wallAlignment";

const OVERLAP_EPSILON = 1e-6;

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
