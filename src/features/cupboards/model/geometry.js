export const ROTATION_STEP = Math.PI / 2;

export const getNormalizedRotation = (rotation) => {
  const fullTurn = Math.PI * 2;
  const normalizedRotation = rotation % fullTurn;

  return normalizedRotation < 0 ? normalizedRotation + fullTurn : normalizedRotation;
};

export const getCupboardRotationDegrees = (rotation) =>
  Math.round((getNormalizedRotation(rotation) * 180) / Math.PI) % 360;

export const getCupboardFootprint = (size, rotation) => {
  const quarterTurns = Math.round(getNormalizedRotation(rotation) / ROTATION_STEP) % 4;

  if (quarterTurns % 2 === 1) {
    return {
      width: size[2],
      depth: size[0],
    };
  }

  return {
    width: size[0],
    depth: size[2],
  };
};
