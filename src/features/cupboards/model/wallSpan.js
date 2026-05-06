import { getCupboardFootprint } from "./geometry";
import { BACK_WALL_ID, LEFT_WALL_ID, RIGHT_WALL_ID } from "./walls";

export const getWallSpanCenter = (position, wall) => {
  switch (wall) {
    case LEFT_WALL_ID:
    case RIGHT_WALL_ID:
      return position.z;
    case BACK_WALL_ID:
    default:
      return position.x;
  }
};

export const setWallSpanCenter = (position, wall, spanCenter) => {
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

export const getWallSpanLength = (footprint, wall) => {
  switch (wall) {
    case LEFT_WALL_ID:
    case RIGHT_WALL_ID:
      return footprint.depth;
    case BACK_WALL_ID:
    default:
      return footprint.width;
  }
};

export const getWallDepth = (footprint, wall) => {
  switch (wall) {
    case LEFT_WALL_ID:
    case RIGHT_WALL_ID:
      return footprint.width;
    case BACK_WALL_ID:
    default:
      return footprint.depth;
  }
};

export const getCupboardWallSpan = ({ size, rotation, position, wall }) => {
  const footprint = getCupboardFootprint(size, rotation);
  const spanCenter = getWallSpanCenter(position, wall);
  const spanLength = getWallSpanLength(footprint, wall);

  return {
    start: spanCenter - spanLength / 2,
    end: spanCenter + spanLength / 2,
  };
};
