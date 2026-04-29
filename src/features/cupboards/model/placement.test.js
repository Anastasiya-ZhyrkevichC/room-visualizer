import {
  alignCupboardToBackWall,
  BACK_WALL_ID,
  CUPBOARD_RESIZE_SIDES,
  getCupboardWidthStepOutcome,
  getCupboardResizeDragOutcome,
  MAGNETIC_ATTACHMENT_EDGES,
  PLACEMENT_VALIDATION_REASONS,
  SAME_WALL_MAGNETIC_TOLERANCE,
  getWallAlignedRotation,
  createPlacementPreview,
  createPlacementValidationResult,
  createCupboard,
  createInitialCupboardPosition,
  getBackWallAlignedPreviewPosition,
  getFloorAlignedPreviewPosition,
  getAttachedCupboardPosition,
  getLeftWallAlignedPreviewPosition,
  getRightWallAlignedPreviewPosition,
  LEFT_WALL_ID,
  RIGHT_WALL_ID,
  validatePlacementCandidate,
} from "./placement";
import { resolveStarterCabinetInstance } from "./catalog";
import {
  cupboardSupportsTableTop,
  resolveCupboardTableTopSupportSurface,
  TABLE_TOP_MERGE_STRATEGIES,
  TABLE_TOP_PROFILE_SHAPES,
} from "./tableTop";

const roomBounds = {
  left: -2,
  right: 2,
  floor: -1.5,
  ceiling: 1.5,
  back: -2,
  front: 2,
};

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

const expectTableTopSupportSurfaceToMatch = (receivedSurface, expectedSurface) => {
  expect(receivedSurface).toMatchObject({
    wall: expectedSurface.wall,
    shape: expectedSurface.shape,
    mergeStrategy: expectedSurface.mergeStrategy,
  });
  expect(receivedSurface.start).toBeCloseTo(expectedSurface.start);
  expect(receivedSurface.end).toBeCloseTo(expectedSurface.end);
  expect(receivedSurface.center).toBeCloseTo(expectedSurface.center);
  expect(receivedSurface.length).toBeCloseTo(expectedSurface.length);
  expect(receivedSurface.depth).toBeCloseTo(expectedSurface.depth);
  expect(receivedSurface.topY).toBeCloseTo(expectedSurface.topY);
  expectPositionToMatch(receivedSurface.position, expectedSurface.position);
  expectBoundsToMatch(receivedSurface.bounds, expectedSurface.bounds);
};

const createPlacedCupboardFixture = ({
  id = 1,
  size = [0.9, 0.72, 0.56],
  position = { x: 0, y: -1.14, z: -1.72 },
  wall = BACK_WALL_ID,
  rotation = getWallAlignedRotation(wall),
  category = "base",
} = {}) => ({
  id,
  catalogId: `fixture-${id}`,
  name: `Fixture cabinet ${id}`,
  category,
  model: {
    front: {
      type: "doubleDoor",
    },
  },
  width: size[0] * 1000,
  height: size[1] * 1000,
  depth: size[2] * 1000,
  price: 0,
  size,
  position,
  rotation,
  wall,
});

const createResizableCupboardFixture = ({
  id = 1,
  activeVariantId = "300x720x560",
  position = { x: 0, y: -1.14, z: -1.72 },
  wall = BACK_WALL_ID,
  rotation = getWallAlignedRotation(wall),
} = {}) => ({
  id,
  ...resolveStarterCabinetInstance({
    catalogId: "base-double-door",
    activeVariantId,
  }),
  position,
  rotation,
  wall,
});

describe("cupboard placement", () => {
  it("places the first cupboard on the floor against the back wall", () => {
    expectPositionToMatch(createInitialCupboardPosition([0.6, 0.72, 0.56], roomBounds), {
      x: 0,
      y: -1.14,
      z: -1.72,
    });
  });

  it("attaches the next cupboard to the end of the previous run", () => {
    const firstCupboard = createCupboard({
      id: 1,
      cabinet: {
        id: "base-double-door",
        activeVariantId: "600x720x560",
        name: "Double-door base cabinet",
        category: "base",
        model: {
          front: {
            type: "doubleDoor",
          },
        },
        availableWidths: [300, 350, 400, 450, 600],
        availableHeights: [720],
        width: 600,
        height: 720,
        depth: 560,
        price: 240,
        size: [0.6, 0.72, 0.56],
      },
      position: createInitialCupboardPosition([0.6, 0.72, 0.56], roomBounds),
    });

    expectPositionToMatch(getAttachedCupboardPosition(firstCupboard, [0.9, 0.72, 0.56]), {
      x: 0.83,
      y: -1.14,
      z: -1.72,
    });
    expect(firstCupboard.catalogFamily).toBe("base-doors");
    expect(firstCupboard.tableTopProfile).toEqual({
      shape: TABLE_TOP_PROFILE_SHAPES.STRAIGHT,
      mergeStrategy: TABLE_TOP_MERGE_STRATEGIES.SAME_WALL,
    });
    expect(firstCupboard.model).toMatchObject({
      front: {
        type: "doubleDoor",
      },
    });
    expect(firstCupboard.activeVariantId).toBe("600x720x560");
  });

  it("normalizes a placed cupboard from its source cabinet definition and active size", () => {
    const firstCupboard = createCupboard({
      id: 1,
      cabinet: {
        catalogId: "base-three-drawer",
        activeVariantId: "600x720x560",
      },
      position: createInitialCupboardPosition([0.6, 0.72, 0.56], roomBounds),
    });

    expect(firstCupboard).toMatchObject({
      catalogId: "base-three-drawer",
      defaultVariantId: "600x720x560",
      activeVariantId: "600x720x560",
      name: "Three-drawer base cabinet",
      category: "drawer",
      catalogFamily: "base-drawers",
      tableTopProfile: {
        shape: TABLE_TOP_PROFILE_SHAPES.STRAIGHT,
        mergeStrategy: TABLE_TOP_MERGE_STRATEGIES.SAME_WALL,
      },
      availableWidths: [600, 800, 900],
      availableHeights: [720],
      width: 600,
      height: 720,
      depth: 560,
      price: 290,
      size: [0.6, 0.72, 0.56],
    });
  });

  it("realigns a rotated cupboard to the back wall", () => {
    expectPositionToMatch(
      alignCupboardToBackWall(
        {
          position: { x: 0.83, y: -1.14, z: -1.72 },
          size: [0.9, 0.72, 0.56],
        },
        Math.PI / 2,
        roomBounds,
      ),
      {
        x: 0.83,
        y: -1.14,
        z: -1.55,
      },
    );
  });

  it("creates an invalid centered back-wall preview for a dragged cabinet", () => {
    const preview = createPlacementPreview(
      {
        id: "base-three-drawer",
        activeVariantId: "900x720x560",
        name: "Three-drawer base cabinet",
        category: "drawer",
        model: {
          front: {
            type: "drawers",
            drawerCount: 3,
          },
        },
        availableWidths: [600, 800, 900],
        availableHeights: [720],
        width: 900,
        height: 720,
        depth: 560,
        price: 390,
        size: [0.9, 0.72, 0.56],
      },
      roomBounds,
    );

    expect(preview).toMatchObject({
      catalogId: "base-three-drawer",
      defaultVariantId: "600x720x560",
      activeVariantId: "600x720x560",
      name: "Three-drawer base cabinet",
      category: "drawer",
      catalogFamily: "base-drawers",
      tableTopProfile: {
        shape: TABLE_TOP_PROFILE_SHAPES.STRAIGHT,
        mergeStrategy: TABLE_TOP_MERGE_STRATEGIES.SAME_WALL,
      },
      availableWidths: [600, 800, 900],
      availableHeights: [720],
      price: 290,
      wall: null,
    });
    expectPositionToMatch(preview.position, {
      x: 0,
      y: -1.14,
      z: -1.72,
    });
    expect(preview.validation).toMatchObject({
      isValid: false,
      reason: PLACEMENT_VALIDATION_REASONS.UNSUPPORTED_WALL,
      wall: null,
      rotation: 0,
      collidingCupboardIds: [],
    });
    expectPositionToMatch(preview.validation.snappedPosition, preview.position);
    expect(preview.model).toMatchObject({
      front: {
        type: "drawers",
      },
    });
  });

  it("raises wall-cabinet previews to a 1280 mm mounting height from the floor", () => {
    const preview = createPlacementPreview(
      {
        catalogId: "wall-double-door",
      },
      roomBounds,
    );

    expect(preview).toMatchObject({
      catalogId: "wall-double-door",
      category: "wall",
      activeVariantId: "300x720x320",
      wall: null,
    });
    expectPositionToMatch(preview.position, {
      x: 0,
      y: 0.14,
      z: -1.84,
    });
  });

  it("evaluates the next width step as available when the resized cabinet still fits in place", () => {
    const resizeOutcome = getCupboardWidthStepOutcome({
      cupboard: createResizableCupboardFixture(),
      direction: "next",
      side: CUPBOARD_RESIZE_SIDES.RIGHT,
      roomBounds,
      cupboards: [],
    });

    expect(resizeOutcome.isAvailable).toBe(true);
    expect(resizeOutcome.cupboard).toMatchObject({
      activeVariantId: "350x720x560",
      width: 350,
      height: 720,
      depth: 560,
      wall: BACK_WALL_ID,
    });
    expect(resizeOutcome.validation).toMatchObject({
      isValid: true,
      reason: null,
      wall: BACK_WALL_ID,
      collidingCupboardIds: [],
    });
    expectPositionToMatch(resizeOutcome.cupboard.position, {
      x: 0.025,
      y: -1.14,
      z: -1.72,
    });
  });

  it("marks the next right-side width step unavailable when it would overlap a neighbor from the fixed edge", () => {
    const resizeOutcome = getCupboardWidthStepOutcome({
      cupboard: createResizableCupboardFixture({
        id: 10,
        activeVariantId: "300x720x560",
        position: { x: -0.6, y: -1.14, z: -1.72 },
      }),
      direction: "next",
      side: CUPBOARD_RESIZE_SIDES.RIGHT,
      roomBounds,
      cupboards: [
        createResizableCupboardFixture({
          id: 11,
          activeVariantId: "300x720x560",
          position: { x: -0.3, y: -1.14, z: -1.72 },
        }),
      ],
    });

    expect(resizeOutcome.isAvailable).toBe(false);
    expect(resizeOutcome.validation).toMatchObject({
      isValid: false,
      reason: PLACEMENT_VALIDATION_REASONS.OVERLAP,
      wall: BACK_WALL_ID,
      collidingCupboardIds: [11],
    });
    expectPositionToMatch(resizeOutcome.cupboard.position, {
      x: -0.575,
      y: -1.14,
      z: -1.72,
    });
  });

  it("marks the next right-side width step unavailable when expanding would push the moving edge past the wall bounds", () => {
    const resizeOutcome = getCupboardWidthStepOutcome({
      cupboard: createResizableCupboardFixture({
        id: 12,
        activeVariantId: "300x720x560",
        position: { x: 1.85, y: -1.14, z: -1.72 },
      }),
      direction: "next",
      side: CUPBOARD_RESIZE_SIDES.RIGHT,
      roomBounds,
      cupboards: [],
    });

    expect(resizeOutcome.isAvailable).toBe(false);
    expect(resizeOutcome.validation).toMatchObject({
      isValid: false,
      reason: PLACEMENT_VALIDATION_REASONS.WALL_BOUNDS,
      wall: BACK_WALL_ID,
      collidingCupboardIds: [],
    });
    expectPositionToMatch(resizeOutcome.cupboard.position, {
      x: 1.875,
      y: -1.14,
      z: -1.72,
    });
  });

  it("maps the left handle on the left wall to the wall-span end so the right edge stays fixed", () => {
    const resizeOutcome = getCupboardWidthStepOutcome({
      cupboard: createResizableCupboardFixture({
        wall: LEFT_WALL_ID,
        rotation: getWallAlignedRotation(LEFT_WALL_ID),
        position: { x: -1.72, y: -1.14, z: 0 },
      }),
      direction: "next",
      side: CUPBOARD_RESIZE_SIDES.LEFT,
      roomBounds,
      cupboards: [],
    });

    expect(resizeOutcome.isAvailable).toBe(true);
    expect(resizeOutcome.cupboard).toMatchObject({
      activeVariantId: "350x720x560",
      wall: LEFT_WALL_ID,
    });
    expectPositionToMatch(resizeOutcome.cupboard.position, {
      x: -1.72,
      y: -1.14,
      z: 0.025,
    });
  });

  it("maps the left handle on the right wall to the wall-span start so the right edge stays fixed", () => {
    const resizeOutcome = getCupboardWidthStepOutcome({
      cupboard: createResizableCupboardFixture({
        wall: RIGHT_WALL_ID,
        rotation: getWallAlignedRotation(RIGHT_WALL_ID),
        position: { x: 1.72, y: -1.14, z: 0 },
      }),
      direction: "next",
      side: CUPBOARD_RESIZE_SIDES.LEFT,
      roomBounds,
      cupboards: [],
    });

    expect(resizeOutcome.isAvailable).toBe(true);
    expect(resizeOutcome.cupboard).toMatchObject({
      activeVariantId: "350x720x560",
      wall: RIGHT_WALL_ID,
    });
    expectPositionToMatch(resizeOutcome.cupboard.position, {
      x: 1.72,
      y: -1.14,
      z: -0.025,
    });
  });

  it("snaps drag-resize to the nearest supported width while keeping the opposite edge fixed", () => {
    const resizeOutcome = getCupboardResizeDragOutcome({
      cupboard: createResizableCupboardFixture({
        activeVariantId: "350x720x560",
        position: { x: 0.025, y: -1.14, z: -1.72 },
      }),
      point: {
        x: 0.12,
        y: 0,
      },
      side: CUPBOARD_RESIZE_SIDES.RIGHT,
      roomBounds,
      cupboards: [],
    });

    expect(resizeOutcome.isAvailable).toBe(true);
    expect(resizeOutcome.cupboard).toMatchObject({
      activeVariantId: "300x720x560",
      width: 300,
      wall: BACK_WALL_ID,
    });
    expectPositionToMatch(resizeOutcome.cupboard.position, {
      x: 0,
      y: -1.14,
      z: -1.72,
    });
  });

  it("validates a supported wall candidate with snapped placement metadata", () => {
    const validation = validatePlacementCandidate({
      candidate: {
        size: [0.9, 0.72, 0.56],
        position: { x: 0, y: -1.14, z: -1.72 },
        rotation: 0,
      },
      wall: LEFT_WALL_ID,
      point: {
        z: 4,
        y: 0.2,
      },
      roomBounds,
    });

    expect(validation).toMatchObject({
      isValid: true,
      reason: null,
      wall: LEFT_WALL_ID,
      rotation: Math.PI / 2,
      collidingCupboardIds: [],
    });
    expectPositionToMatch(validation.snappedPosition, {
      x: -1.72,
      y: -1.14,
      z: 1.55,
    });
  });

  it("rejects a same-wall placement that overlaps another cabinet", () => {
    const validation = validatePlacementCandidate({
      candidate: {
        size: [0.9, 0.72, 0.56],
        position: { x: -1.55, y: -1.14, z: -1.72 },
        rotation: getWallAlignedRotation(BACK_WALL_ID),
      },
      wall: BACK_WALL_ID,
      point: {
        x: 0.2,
        y: 0.2,
      },
      roomBounds,
      cupboards: [createPlacedCupboardFixture()],
    });

    expect(validation).toMatchObject({
      isValid: false,
      reason: PLACEMENT_VALIDATION_REASONS.OVERLAP,
      wall: BACK_WALL_ID,
      rotation: 0,
      collidingCupboardIds: [1],
    });
    expectPositionToMatch(validation.snappedPosition, {
      x: 0.2,
      y: -1.14,
      z: -1.72,
    });
  });

  it("allows a wall cabinet to share the same wall span when it is mounted above a base cabinet", () => {
    const validation = validatePlacementCandidate({
      candidate: {
        category: "wall",
        size: [0.6, 0.72, 0.32],
        position: { x: 0, y: 0.14, z: -1.84 },
        rotation: getWallAlignedRotation(BACK_WALL_ID),
      },
      wall: BACK_WALL_ID,
      point: {
        x: 0,
        y: 0.2,
      },
      roomBounds,
      cupboards: [createPlacedCupboardFixture()],
    });

    expect(validation).toMatchObject({
      isValid: true,
      reason: null,
      wall: BACK_WALL_ID,
      rotation: 0,
      collidingCupboardIds: [],
    });
    expectPositionToMatch(validation.snappedPosition, {
      x: 0,
      y: 0.14,
      z: -1.84,
    });
  });

  it("allows same-wall edge contact without treating it as overlap", () => {
    const validation = validatePlacementCandidate({
      candidate: {
        size: [0.6, 0.72, 0.56],
        position: { x: -1.7, y: -1.14, z: -1.72 },
        rotation: getWallAlignedRotation(BACK_WALL_ID),
      },
      wall: BACK_WALL_ID,
      point: {
        x: 0.75,
        y: 0.2,
      },
      roomBounds,
      cupboards: [createPlacedCupboardFixture()],
    });

    expect(validation).toMatchObject({
      isValid: true,
      reason: null,
      wall: BACK_WALL_ID,
      rotation: 0,
      collidingCupboardIds: [],
    });
    expectPositionToMatch(validation.snappedPosition, {
      x: 0.75,
      y: -1.14,
      z: -1.72,
    });
  });

  it("magnetically holds a same-wall placement just past first contact", () => {
    const validation = validatePlacementCandidate({
      candidate: {
        size: [0.6, 0.72, 0.56],
        position: { x: -1.7, y: -1.14, z: -1.72 },
        rotation: getWallAlignedRotation(BACK_WALL_ID),
      },
      wall: BACK_WALL_ID,
      point: {
        x: 0.75 - SAME_WALL_MAGNETIC_TOLERANCE / 4,
        y: 0.2,
      },
      roomBounds,
      cupboards: [createPlacedCupboardFixture()],
    });

    expect(validation).toMatchObject({
      isValid: true,
      reason: null,
      wall: BACK_WALL_ID,
      rotation: 0,
      collidingCupboardIds: [],
      isMagneticallySnapped: true,
      magneticAttachment: {
        cupboardId: 1,
        edge: MAGNETIC_ATTACHMENT_EDGES.END,
      },
    });
    expect(validation.magneticAttachment.intrusionDistance).toBeCloseTo(SAME_WALL_MAGNETIC_TOLERANCE / 4);
    expectPositionToMatch(validation.snappedPosition, {
      x: 0.75,
      y: -1.14,
      z: -1.72,
    });
  });

  it("keeps a same-wall placement valid while the pointer stays inside the magnetic buffer", () => {
    const overshoot = SAME_WALL_MAGNETIC_TOLERANCE - 0.01;
    const validation = validatePlacementCandidate({
      candidate: {
        size: [0.6, 0.72, 0.56],
        position: { x: -1.7, y: -1.14, z: -1.72 },
        rotation: getWallAlignedRotation(BACK_WALL_ID),
      },
      wall: BACK_WALL_ID,
      point: {
        x: 0.75 - overshoot,
        y: 0.2,
      },
      roomBounds,
      cupboards: [createPlacedCupboardFixture()],
    });

    expect(validation).toMatchObject({
      isValid: true,
      reason: null,
      collidingCupboardIds: [],
      isMagneticallySnapped: true,
      magneticAttachment: {
        cupboardId: 1,
        edge: MAGNETIC_ATTACHMENT_EDGES.END,
      },
    });
    expect(validation.magneticAttachment.intrusionDistance).toBeCloseTo(overshoot);
    expectPositionToMatch(validation.snappedPosition, {
      x: 0.75,
      y: -1.14,
      z: -1.72,
    });
  });

  it("keeps both the raw and held positions available while magnetically snapped", () => {
    const overshoot = SAME_WALL_MAGNETIC_TOLERANCE / 2;
    const validation = validatePlacementCandidate({
      candidate: {
        size: [0.6, 0.72, 0.56],
        position: { x: -1.7, y: -1.14, z: -1.72 },
        rotation: getWallAlignedRotation(BACK_WALL_ID),
      },
      wall: BACK_WALL_ID,
      point: {
        x: 0.75 - overshoot,
        y: 0.2,
      },
      roomBounds,
      cupboards: [createPlacedCupboardFixture()],
    });

    expect(validation.isValid).toBe(true);
    expect(validation.isMagneticallySnapped).toBe(true);
    expectPositionToMatch(validation.snappedPosition, {
      x: 0.75,
      y: -1.14,
      z: -1.72,
    });
    expectPositionToMatch(validation.rawSnappedPosition, {
      x: 0.75 - overshoot,
      y: -1.14,
      z: -1.72,
    });
  });

  it("rejects a same-wall overlap once the magnetic buffer is exceeded", () => {
    const overshoot = SAME_WALL_MAGNETIC_TOLERANCE + 0.02;
    const validation = validatePlacementCandidate({
      candidate: {
        size: [0.6, 0.72, 0.56],
        position: { x: -1.7, y: -1.14, z: -1.72 },
        rotation: getWallAlignedRotation(BACK_WALL_ID),
      },
      wall: BACK_WALL_ID,
      point: {
        x: 0.75 - overshoot,
        y: 0.2,
      },
      roomBounds,
      cupboards: [createPlacedCupboardFixture()],
    });

    expect(validation).toMatchObject({
      isValid: false,
      reason: PLACEMENT_VALIDATION_REASONS.OVERLAP,
      wall: BACK_WALL_ID,
      rotation: 0,
      collidingCupboardIds: [1],
      isMagneticallySnapped: false,
      magneticAttachment: null,
    });
    expectPositionToMatch(validation.snappedPosition, {
      x: 0.75 - overshoot,
      y: -1.14,
      z: -1.72,
    });
    expectPositionToMatch(validation.rawSnappedPosition, validation.snappedPosition);
  });

  it("rejects a back-wall placement that intersects a side-wall cabinet near the corner", () => {
    const validation = validatePlacementCandidate({
      candidate: {
        size: [0.9, 0.72, 0.56],
        position: { x: 0, y: -1.14, z: -1.72 },
        rotation: getWallAlignedRotation(BACK_WALL_ID),
      },
      wall: BACK_WALL_ID,
      point: {
        x: -2,
        y: 0.2,
      },
      roomBounds,
      cupboards: [
        createPlacedCupboardFixture({
          id: 2,
          wall: LEFT_WALL_ID,
          position: { x: -1.72, y: -1.14, z: -1.55 },
          rotation: getWallAlignedRotation(LEFT_WALL_ID),
        }),
      ],
    });

    expect(validation).toMatchObject({
      isValid: false,
      reason: PLACEMENT_VALIDATION_REASONS.CORNER_COLLISION,
      wall: BACK_WALL_ID,
      rotation: 0,
      collidingCupboardIds: [2],
    });
    expectPositionToMatch(validation.snappedPosition, {
      x: -1.55,
      y: -1.14,
      z: -1.72,
    });
  });

  it("allows cross-wall edge contact without treating it as a corner collision", () => {
    const validation = validatePlacementCandidate({
      candidate: {
        size: [0.9, 0.72, 0.56],
        position: { x: 0, y: -1.14, z: -1.72 },
        rotation: getWallAlignedRotation(BACK_WALL_ID),
      },
      wall: BACK_WALL_ID,
      point: {
        x: -0.99,
        y: 0.2,
      },
      roomBounds,
      cupboards: [
        createPlacedCupboardFixture({
          id: 2,
          wall: LEFT_WALL_ID,
          position: { x: -1.72, y: -1.14, z: -1.55 },
          rotation: getWallAlignedRotation(LEFT_WALL_ID),
        }),
      ],
    });

    expect(validation).toMatchObject({
      isValid: true,
      reason: null,
      wall: BACK_WALL_ID,
      rotation: 0,
      collidingCupboardIds: [],
    });
    expectPositionToMatch(validation.snappedPosition, {
      x: -0.99,
      y: -1.14,
      z: -1.72,
    });
  });

  it("keeps the current candidate position visible when validation fails", () => {
    const validation = validatePlacementCandidate({
      candidate: {
        size: [0.9, 0.72, 0.56],
        position: { x: 0.4, y: -1.14, z: -1.72 },
        rotation: getWallAlignedRotation(BACK_WALL_ID),
      },
      wall: null,
      point: null,
      roomBounds,
    });

    expect(validation).toEqual(
      createPlacementValidationResult({
        isValid: false,
        reason: PLACEMENT_VALIDATION_REASONS.UNSUPPORTED_WALL,
        wall: null,
        rotation: getWallAlignedRotation(BACK_WALL_ID),
        snappedPosition: { x: 0.4, y: -1.14, z: -1.72 },
      }),
    );
  });

  it("keeps the floor preview within the room bounds while the pointer moves", () => {
    expectPositionToMatch(getFloorAlignedPreviewPosition([0.9, 0.72, 0.56], { x: 5, z: -4 }, roomBounds), {
      x: 1.55,
      y: -1.14,
      z: -1.72,
    });
  });

  it("keeps the back-wall preview flush to the wall and within the wall span", () => {
    expectPositionToMatch(getBackWallAlignedPreviewPosition([0.9, 0.72, 0.56], { x: 5 }, roomBounds), {
      x: 1.55,
      y: -1.14,
      z: -1.72,
    });
  });

  it("rotates cupboards to face the left and right walls", () => {
    expect(getWallAlignedRotation(LEFT_WALL_ID)).toBeCloseTo(Math.PI / 2);
    expect(getWallAlignedRotation(RIGHT_WALL_ID)).toBeCloseTo(Math.PI * 1.5);
  });

  it("keeps the left-wall preview flush to the wall and within the wall span", () => {
    expectPositionToMatch(getLeftWallAlignedPreviewPosition([0.9, 0.72, 0.56], { z: 5 }, roomBounds), {
      x: -1.72,
      y: -1.14,
      z: 1.55,
    });
  });

  it("keeps the right-wall preview flush to the wall and within the wall span", () => {
    expectPositionToMatch(getRightWallAlignedPreviewPosition([0.9, 0.72, 0.56], { z: -5 }, roomBounds), {
      x: 1.72,
      y: -1.14,
      z: -1.55,
    });
  });
});

describe("tabletop support surface", () => {
  it("resolves a same-wall straight tabletop support surface for base cupboards", () => {
    const cupboard = createCupboard({
      id: 1,
      cabinet: {
        catalogId: "base-double-door",
        activeVariantId: "600x720x560",
      },
      position: { x: 0, y: -1.14, z: -1.72 },
      rotation: getWallAlignedRotation(BACK_WALL_ID),
      wall: BACK_WALL_ID,
    });

    expect(cupboardSupportsTableTop(cupboard)).toBe(true);
    expectTableTopSupportSurfaceToMatch(resolveCupboardTableTopSupportSurface(cupboard), {
      wall: BACK_WALL_ID,
      shape: TABLE_TOP_PROFILE_SHAPES.STRAIGHT,
      mergeStrategy: TABLE_TOP_MERGE_STRATEGIES.SAME_WALL,
      start: -0.3,
      end: 0.3,
      center: 0,
      length: 0.6,
      depth: 0.56,
      topY: -0.78,
      position: {
        x: 0,
        y: -0.78,
        z: -1.72,
      },
      bounds: {
        minX: -0.3,
        maxX: 0.3,
        minZ: -2,
        maxZ: -1.44,
      },
    });
  });

  it("keeps tabletop support geometry wall-aware when a cupboard rotates onto the left wall", () => {
    const cupboard = createCupboard({
      id: 2,
      cabinet: {
        catalogId: "base-three-drawer",
        activeVariantId: "900x720x560",
      },
      position: { x: -1.72, y: -1.14, z: -0.5 },
      rotation: getWallAlignedRotation(LEFT_WALL_ID),
      wall: LEFT_WALL_ID,
    });

    expectTableTopSupportSurfaceToMatch(resolveCupboardTableTopSupportSurface(cupboard), {
      wall: LEFT_WALL_ID,
      shape: TABLE_TOP_PROFILE_SHAPES.STRAIGHT,
      mergeStrategy: TABLE_TOP_MERGE_STRATEGIES.SAME_WALL,
      start: -0.95,
      end: -0.05,
      center: -0.5,
      length: 0.9,
      depth: 0.56,
      topY: -0.78,
      position: {
        x: -1.72,
        y: -0.78,
        z: -0.5,
      },
      bounds: {
        minX: -2,
        maxX: -1.44,
        minZ: -0.95,
        maxZ: -0.05,
      },
    });
  });

  it("leaves tall cupboards out of tabletop support until they are deliberately enabled", () => {
    const cupboard = createCupboard({
      id: 3,
      cabinet: {
        catalogId: "tall-pantry",
        activeVariantId: "600x2100x600",
      },
      position: { x: 0, y: -0.45, z: -1.7 },
      rotation: getWallAlignedRotation(BACK_WALL_ID),
      wall: BACK_WALL_ID,
    });

    expect(cupboardSupportsTableTop(cupboard)).toBe(false);
    expect(resolveCupboardTableTopSupportSurface(cupboard)).toBeNull();
  });
});
