import { resolveStarterCabinetInstance } from "./catalog";
import { getCupboardFootprint } from "./geometry";
import { PLACEMENT_VALIDATION_REASONS } from "./placementConstants";
import { getCabinetWallAlignedPreviewPosition, getWallAlignedRotation } from "./wallAlignment";
import { BACK_WALL_ID } from "./walls";

const CABINET_GAP = 0.08;

const createPosition = (x, y, z) => ({ x, y, z });
const clonePosition = (position) => (position ? { ...position } : position);

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

export const createPlacementPreview = (cabinet, roomBounds, { variantId = null } = {}) => {
  const resolvedCabinet =
    resolveStarterCabinetInstance(cabinet, {
      variantId,
      useDefaultVariant: !variantId,
    }) ?? cabinet;
  const initialRotation = getWallAlignedRotation(BACK_WALL_ID);
  const initialPosition = getCabinetWallAlignedPreviewPosition(
    resolvedCabinet,
    { x: 0 },
    roomBounds,
    BACK_WALL_ID,
    initialRotation,
  );

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

export const getAttachedCupboardPosition = (lastCupboard, nextSize) => {
  const nextFootprint = getCupboardFootprint(nextSize, 0);
  const anchorPoint = getBottomRight(lastCupboard);

  return createPosition(
    anchorPoint.x + nextFootprint.width / 2 + CABINET_GAP,
    anchorPoint.y + nextSize[1] / 2,
    anchorPoint.z + nextFootprint.depth / 2,
  );
};
