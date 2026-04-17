import { convertMillimetersToMeters } from "../../../lib/units";
import { getCupboardFootprint } from "./geometry";
import { BACK_WALL_ID, LEFT_WALL_ID, RIGHT_WALL_ID } from "./walls";

export const TABLE_TOP_THICKNESS = convertMillimetersToMeters(40);
export const TABLE_TOP_FRONT_OVERHANG = convertMillimetersToMeters(20);
export const TABLE_TOP_MERGE_TOLERANCE = convertMillimetersToMeters(5);

export const TABLE_TOP_PROFILE_SHAPES = Object.freeze({
  STRAIGHT: "straight",
});

export const TABLE_TOP_MERGE_STRATEGIES = Object.freeze({
  SAME_WALL: "same-wall-only",
});

export const STRAIGHT_RUN_TABLE_TOP_PROFILE = Object.freeze({
  shape: TABLE_TOP_PROFILE_SHAPES.STRAIGHT,
  mergeStrategy: TABLE_TOP_MERGE_STRATEGIES.SAME_WALL,
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

const getWallDepth = (footprint, wall) => {
  switch (wall) {
    case LEFT_WALL_ID:
    case RIGHT_WALL_ID:
      return footprint.width;
    case BACK_WALL_ID:
    default:
      return footprint.depth;
  }
};

export const cupboardSupportsTableTop = (cupboard) => Boolean(cupboard?.tableTopProfile);

export const resolveCupboardTableTopSupportSurface = (cupboard) => {
  if (
    !cupboardSupportsTableTop(cupboard) ||
    !Array.isArray(cupboard?.size) ||
    !cupboard?.position ||
    ![BACK_WALL_ID, LEFT_WALL_ID, RIGHT_WALL_ID].includes(cupboard?.wall)
  ) {
    return null;
  }

  const footprint = getCupboardFootprint(cupboard.size, cupboard.rotation ?? 0);
  const spanCenter = getWallSpanCenter(cupboard.position, cupboard.wall);
  const spanLength = getWallSpanLength(footprint, cupboard.wall);
  const depth = getWallDepth(footprint, cupboard.wall);
  const topY = cupboard.position.y + cupboard.size[1] / 2;

  return {
    wall: cupboard.wall,
    shape: cupboard.tableTopProfile.shape,
    mergeStrategy: cupboard.tableTopProfile.mergeStrategy,
    start: spanCenter - spanLength / 2,
    end: spanCenter + spanLength / 2,
    center: spanCenter,
    length: spanLength,
    depth,
    topY,
    position: {
      x: cupboard.position.x,
      y: topY,
      z: cupboard.position.z,
    },
    bounds: {
      minX: cupboard.position.x - footprint.width / 2,
      maxX: cupboard.position.x + footprint.width / 2,
      minZ: cupboard.position.z - footprint.depth / 2,
      maxZ: cupboard.position.z + footprint.depth / 2,
    },
  };
};
