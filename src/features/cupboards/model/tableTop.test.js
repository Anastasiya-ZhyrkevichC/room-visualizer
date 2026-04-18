import { resolveStarterCabinetInstance } from "./catalog";
import { getWallAlignedRotation } from "./wallAlignment";
import { BACK_WALL_ID, LEFT_WALL_ID } from "./walls";
import { TABLE_TOP_FRONT_OVERHANG, TABLE_TOP_MERGE_TOLERANCE, TABLE_TOP_THICKNESS, deriveTableTopRuns } from "./tableTop";

const expectPositionToMatch = (receivedPosition, expectedPosition) => {
  expect(receivedPosition.x).toBeCloseTo(expectedPosition.x);
  expect(receivedPosition.y).toBeCloseTo(expectedPosition.y);
  expect(receivedPosition.z).toBeCloseTo(expectedPosition.z);
};

const expectBoundsToMatch = (receivedBounds, expectedBounds) => {
  expect(receivedBounds.minX).toBeCloseTo(expectedBounds.minX);
  expect(receivedBounds.maxX).toBeCloseTo(expectedBounds.maxX);
  expect(receivedBounds.minZ).toBeCloseTo(expectedBounds.minZ);
  expect(receivedBounds.maxZ).toBeCloseTo(expectedBounds.maxZ);
};

const expectSizeToMatch = (receivedSize, expectedSize) => {
  expect(receivedSize).toHaveLength(expectedSize.length);
  receivedSize.forEach((value, index) => {
    expect(value).toBeCloseTo(expectedSize[index]);
  });
};

const expectRunToMatch = (receivedRun, expectedRun) => {
  expect(receivedRun.id).toBe(expectedRun.id);
  expect(receivedRun.wall).toBe(expectedRun.wall);
  expect(receivedRun.start).toBeCloseTo(expectedRun.start);
  expect(receivedRun.end).toBeCloseTo(expectedRun.end);
  expect(receivedRun.center).toBeCloseTo(expectedRun.center);
  expect(receivedRun.length).toBeCloseTo(expectedRun.length);
  expect(receivedRun.topY).toBeCloseTo(expectedRun.topY);
  expect(receivedRun.supportDepth).toBeCloseTo(expectedRun.supportDepth);
  expect(receivedRun.depth).toBeCloseTo(expectedRun.depth);
  expect(receivedRun.thickness).toBeCloseTo(expectedRun.thickness);
  expect(receivedRun.cupboardIds).toEqual(expectedRun.cupboardIds);
};

const createPlacedCupboardFixture = ({
  id,
  catalogId = "base-double-door",
  activeVariantId = "600x720x560",
  position = { x: 0, y: -1.14, z: -1.72 },
  wall = BACK_WALL_ID,
  rotation = getWallAlignedRotation(wall),
  width,
  height,
  depth,
  size,
  ...rest
} = {}) => {
  const resolvedCabinet = resolveStarterCabinetInstance({
    catalogId,
    activeVariantId,
  });

  return {
    id,
    ...resolvedCabinet,
    width: width ?? resolvedCabinet.width,
    height: height ?? resolvedCabinet.height,
    depth: depth ?? resolvedCabinet.depth,
    size: size ?? resolvedCabinet.size,
    position,
    rotation,
    wall,
    ...rest,
  };
};

describe("deriveTableTopRuns", () => {
  it("merges flush neighbouring base cupboards on the same wall into one tabletop run", () => {
    const runs = deriveTableTopRuns([
      createPlacedCupboardFixture({
        id: 1,
        position: { x: -0.3, y: -1.14, z: -1.72 },
      }),
      createPlacedCupboardFixture({
        id: 2,
        position: { x: 0.3, y: -1.14, z: -1.72 },
      }),
      createPlacedCupboardFixture({
        id: 3,
        position: { x: 0.9, y: -1.14, z: -1.7 },
        depth: 600,
        size: [0.6, 0.72, 0.6],
      }),
    ]);

    expect(runs).toHaveLength(1);
    expectRunToMatch(runs[0], {
      id: "table-top-back-1-2-3",
      wall: BACK_WALL_ID,
      start: -0.6,
      end: 1.2,
      center: 0.3,
      length: 1.8,
      topY: -0.78,
      supportDepth: 0.6,
      depth: 0.6 + TABLE_TOP_FRONT_OVERHANG,
      thickness: TABLE_TOP_THICKNESS,
      cupboardIds: [1, 2, 3],
    });
    expectPositionToMatch(runs[0].position, {
      x: 0.3,
      y: -0.76,
      z: -1.69,
    });
    expectSizeToMatch(runs[0].size, [1.8, TABLE_TOP_THICKNESS, 0.62]);
    expectBoundsToMatch(runs[0].bounds, {
      minX: -0.6,
      maxX: 1.2,
      minZ: -2,
      maxZ: -1.38,
    });
  });

  it("keeps disconnected cupboard groups as separate tabletop runs", () => {
    const runs = deriveTableTopRuns([
      createPlacedCupboardFixture({
        id: 1,
        position: { x: -0.3, y: -1.14, z: -1.72 },
      }),
      createPlacedCupboardFixture({
        id: 2,
        position: { x: 1.1, y: -1.14, z: -1.72 },
      }),
    ]);

    expect(runs).toHaveLength(2);
    expect(runs.map((run) => run.id)).toEqual(["table-top-back-1", "table-top-back-2"]);
    expect(runs[0].length).toBeCloseTo(0.6);
    expect(runs[1].length).toBeCloseTo(0.6);
  });

  it("tolerates tiny floating-point gaps when merging one continuous same-wall run", () => {
    const runs = deriveTableTopRuns([
      createPlacedCupboardFixture({
        id: 1,
        position: { x: -0.3, y: -1.14, z: -1.72 },
      }),
      createPlacedCupboardFixture({
        id: 2,
        position: { x: 0.3 + TABLE_TOP_MERGE_TOLERANCE / 2, y: -1.14, z: -1.72 },
      }),
    ]);

    expect(runs).toHaveLength(1);
    expect(runs[0].start).toBeCloseTo(-0.6);
    expect(runs[0].end).toBeCloseTo(0.6 + TABLE_TOP_MERGE_TOLERANCE / 2);
    expect(runs[0].length).toBeCloseTo(1.2 + TABLE_TOP_MERGE_TOLERANCE / 2);
    expect(runs[0].cupboardIds).toEqual([1, 2]);
  });

  it("does not merge cupboards that sit on different walls", () => {
    const runs = deriveTableTopRuns([
      createPlacedCupboardFixture({
        id: 1,
        position: { x: 0, y: -1.14, z: -1.72 },
        wall: BACK_WALL_ID,
        rotation: getWallAlignedRotation(BACK_WALL_ID),
      }),
      createPlacedCupboardFixture({
        id: 2,
        position: { x: -1.72, y: -1.14, z: 0 },
        wall: LEFT_WALL_ID,
        rotation: getWallAlignedRotation(LEFT_WALL_ID),
      }),
    ]);

    expect(runs).toHaveLength(2);
    expect(runs.map((run) => run.wall)).toEqual([BACK_WALL_ID, LEFT_WALL_ID]);
    expect(runs[0].cupboardIds).toEqual([1]);
    expect(runs[1].cupboardIds).toEqual([2]);
  });

  it("does not merge cupboards that resolve to different tabletop heights", () => {
    const runs = deriveTableTopRuns([
      createPlacedCupboardFixture({
        id: 1,
        position: { x: -0.3, y: -1.14, z: -1.72 },
      }),
      createPlacedCupboardFixture({
        id: 2,
        position: { x: 0.3, y: -1.04, z: -1.72 },
      }),
    ]);

    expect(runs).toHaveLength(2);
    expect(runs[0].topY).toBeCloseTo(-0.78);
    expect(runs[1].topY).toBeCloseTo(-0.68);
  });

  it("ignores cupboards that do not support table tops", () => {
    const runs = deriveTableTopRuns([
      createPlacedCupboardFixture({
        id: 1,
        position: { x: 0, y: -1.14, z: -1.72 },
      }),
      createPlacedCupboardFixture({
        id: 2,
        catalogId: "tall-pantry",
        activeVariantId: "600x2100x600",
        position: { x: 1.2, y: -0.45, z: -1.7 },
      }),
    ]);

    expect(runs).toHaveLength(1);
    expect(runs[0].cupboardIds).toEqual([1]);
  });
});
