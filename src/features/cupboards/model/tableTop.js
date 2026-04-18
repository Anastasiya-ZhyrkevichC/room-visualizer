import { convertMillimetersToMeters } from "../../../lib/units";
import { getCupboardFootprint } from "./geometry";
import { getCupboardWallSpan, getWallDepth } from "./wallSpan";
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

const TABLE_TOP_WALL_ORDER = Object.freeze([BACK_WALL_ID, LEFT_WALL_ID, RIGHT_WALL_ID]);

const compareCupboardIds = (firstId, secondId) => {
  if (typeof firstId === "number" && typeof secondId === "number") {
    return firstId - secondId;
  }

  return String(firstId).localeCompare(String(secondId), undefined, {
    numeric: true,
  });
};

const getWallSortOrder = (wall) => {
  const wallIndex = TABLE_TOP_WALL_ORDER.indexOf(wall);

  return wallIndex === -1 ? TABLE_TOP_WALL_ORDER.length : wallIndex;
};

const compareSurfaceCandidates = (firstCandidate, secondCandidate) => {
  const firstSurface = firstCandidate.surface;
  const secondSurface = secondCandidate.surface;

  return (
    getWallSortOrder(firstSurface.wall) - getWallSortOrder(secondSurface.wall) ||
    firstSurface.topY - secondSurface.topY ||
    firstSurface.start - secondSurface.start ||
    firstSurface.end - secondSurface.end ||
    compareCupboardIds(firstCandidate.cupboardId, secondCandidate.cupboardId)
  );
};

const normalizeTolerance = (value, fallbackValue) =>
  Number.isFinite(value) ? Math.max(0, value) : fallbackValue;

const getTableTopRunBounds = ({ wall, supportBounds, depth }) => {
  switch (wall) {
    case LEFT_WALL_ID:
      return {
        minX: supportBounds.minX,
        maxX: supportBounds.minX + depth,
        minZ: supportBounds.minZ,
        maxZ: supportBounds.maxZ,
      };
    case RIGHT_WALL_ID:
      return {
        minX: supportBounds.maxX - depth,
        maxX: supportBounds.maxX,
        minZ: supportBounds.minZ,
        maxZ: supportBounds.maxZ,
      };
    case BACK_WALL_ID:
    default:
      return {
        minX: supportBounds.minX,
        maxX: supportBounds.maxX,
        minZ: supportBounds.minZ,
        maxZ: supportBounds.minZ + depth,
      };
  }
};

const createRunAccumulator = ({ cupboardId, surface }) => ({
  wall: surface.wall,
  shape: surface.shape,
  mergeStrategy: surface.mergeStrategy,
  start: surface.start,
  end: surface.end,
  supportDepth: surface.depth,
  supportBounds: { ...surface.bounds },
  minTopY: surface.topY,
  maxTopY: surface.topY,
  topYSum: surface.topY,
  surfaceCount: 1,
  cupboardIds: [cupboardId],
});

const mergeSurfaceIntoAccumulator = (run, { cupboardId, surface }) => ({
  ...run,
  start: Math.min(run.start, surface.start),
  end: Math.max(run.end, surface.end),
  supportDepth: Math.max(run.supportDepth, surface.depth),
  supportBounds: {
    minX: Math.min(run.supportBounds.minX, surface.bounds.minX),
    maxX: Math.max(run.supportBounds.maxX, surface.bounds.maxX),
    minZ: Math.min(run.supportBounds.minZ, surface.bounds.minZ),
    maxZ: Math.max(run.supportBounds.maxZ, surface.bounds.maxZ),
  },
  minTopY: Math.min(run.minTopY, surface.topY),
  maxTopY: Math.max(run.maxTopY, surface.topY),
  topYSum: run.topYSum + surface.topY,
  surfaceCount: run.surfaceCount + 1,
  cupboardIds: [...run.cupboardIds, cupboardId],
});

const canMergeSurfaceIntoRun = (run, surface, mergeTolerance) =>
  run.wall === surface.wall &&
  run.shape === surface.shape &&
  run.mergeStrategy === surface.mergeStrategy &&
  Math.max(run.maxTopY, surface.topY) - Math.min(run.minTopY, surface.topY) <= mergeTolerance &&
  surface.start - run.end <= mergeTolerance;

const finalizeTableTopRun = (run) => {
  const cupboardIds = [...run.cupboardIds].sort(compareCupboardIds);
  const length = run.end - run.start;
  const center = run.start + length / 2;
  const topY = run.topYSum / run.surfaceCount;
  const depth = run.supportDepth + TABLE_TOP_FRONT_OVERHANG;
  const bounds = getTableTopRunBounds({
    wall: run.wall,
    supportBounds: run.supportBounds,
    depth,
  });

  return {
    id: `table-top-${run.wall}-${cupboardIds.join("-")}`,
    wall: run.wall,
    shape: run.shape,
    mergeStrategy: run.mergeStrategy,
    start: run.start,
    end: run.end,
    center,
    length,
    topY,
    supportDepth: run.supportDepth,
    frontOverhang: TABLE_TOP_FRONT_OVERHANG,
    depth,
    thickness: TABLE_TOP_THICKNESS,
    cupboardIds,
    position: {
      x: (bounds.minX + bounds.maxX) / 2,
      y: topY + TABLE_TOP_THICKNESS / 2,
      z: (bounds.minZ + bounds.maxZ) / 2,
    },
    size: [bounds.maxX - bounds.minX, TABLE_TOP_THICKNESS, bounds.maxZ - bounds.minZ],
    bounds,
  };
};

const compareTableTopRuns = (firstRun, secondRun) =>
  getWallSortOrder(firstRun.wall) - getWallSortOrder(secondRun.wall) ||
  firstRun.topY - secondRun.topY ||
  firstRun.start - secondRun.start ||
  firstRun.end - secondRun.end ||
  firstRun.id.localeCompare(secondRun.id);

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
  const span = getCupboardWallSpan(cupboard);
  const depth = getWallDepth(footprint, cupboard.wall);
  const topY = cupboard.position.y + cupboard.size[1] / 2;

  return {
    wall: cupboard.wall,
    shape: cupboard.tableTopProfile.shape,
    mergeStrategy: cupboard.tableTopProfile.mergeStrategy,
    start: span.start,
    end: span.end,
    center: (span.start + span.end) / 2,
    length: span.end - span.start,
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

export const deriveTableTopRuns = (cupboards, { mergeTolerance = TABLE_TOP_MERGE_TOLERANCE } = {}) => {
  if (!Array.isArray(cupboards) || cupboards.length === 0) {
    return [];
  }

  const resolvedMergeTolerance = normalizeTolerance(mergeTolerance, TABLE_TOP_MERGE_TOLERANCE);
  const surfaceCandidates = cupboards
    .map((cupboard) => {
      const surface = resolveCupboardTableTopSupportSurface(cupboard);

      return surface
        ? {
            cupboardId: cupboard.id,
            surface,
          }
        : null;
    })
    .filter(Boolean)
    .sort(compareSurfaceCandidates);

  if (surfaceCandidates.length === 0) {
    return [];
  }

  return surfaceCandidates
    .reduce((runs, candidate) => {
      const currentRun = runs[runs.length - 1];

      if (!currentRun || !canMergeSurfaceIntoRun(currentRun, candidate.surface, resolvedMergeTolerance)) {
        runs.push(createRunAccumulator(candidate));
        return runs;
      }

      runs[runs.length - 1] = mergeSurfaceIntoAccumulator(currentRun, candidate);
      return runs;
    }, [])
    .map(finalizeTableTopRun)
    .sort(compareTableTopRuns);
};
