import { getCupboardFootprint } from "./geometry";

export const CABINET_GAP = 0.08;

const createPosition = (x, y, z) => ({ x, y, z });

const getBottomRight = (cupboard) => {
  const footprint = getCupboardFootprint(cupboard.size, cupboard.rotation);

  return createPosition(
    cupboard.position.x + footprint.width / 2,
    cupboard.position.y - cupboard.size[1] / 2,
    cupboard.position.z - footprint.depth / 2,
  );
};

export const createCupboard = ({ id, cabinet, position, rotation = 0 }) => ({
  id,
  catalogId: cabinet.id,
  name: cabinet.name,
  description: cabinet.description,
  dimensionsMm: cabinet.dimensionsMm,
  size: cabinet.size,
  position,
  rotation,
});

export const createInitialCupboardPosition = (size, roomBounds) => {
  const footprint = getCupboardFootprint(size, 0);

  return createPosition(0, roomBounds.floor + size[1] / 2, roomBounds.back + footprint.depth / 2);
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
  const footprint = getCupboardFootprint(cupboard.size, rotation);

  return {
    ...cupboard.position,
    z: roomBounds.back + footprint.depth / 2,
  };
};
