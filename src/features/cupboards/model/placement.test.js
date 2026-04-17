import {
  alignCupboardToBackWall,
  BACK_WALL_ID,
  getCupboardWidthStepOutcome,
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

const createPlacedCupboardFixture = ({
  id = 1,
  size = [0.9, 0.72, 0.56],
  position = { x: 0, y: -1.14, z: -1.72 },
  wall = BACK_WALL_ID,
  rotation = getWallAlignedRotation(wall),
} = {}) => ({
  id,
  catalogId: `fixture-${id}`,
  name: `Fixture cabinet ${id}`,
  category: "base",
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

  it("evaluates the next width step as available when the resized cabinet still fits in place", () => {
    const resizeOutcome = getCupboardWidthStepOutcome({
      cupboard: createResizableCupboardFixture(),
      direction: "next",
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
      x: 0,
      y: -1.14,
      z: -1.72,
    });
  });

  it("marks the next width step unavailable when it would only fit by shifting away from a neighbor", () => {
    const resizeOutcome = getCupboardWidthStepOutcome({
      cupboard: createResizableCupboardFixture({
        id: 10,
        activeVariantId: "300x720x560",
        position: { x: -0.6, y: -1.14, z: -1.72 },
      }),
      direction: "next",
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
      isValid: true,
      reason: null,
      wall: BACK_WALL_ID,
      isMagneticallySnapped: true,
      magneticAttachment: {
        cupboardId: 11,
        edge: MAGNETIC_ATTACHMENT_EDGES.START,
      },
      collidingCupboardIds: [],
    });
    expectPositionToMatch(resizeOutcome.validation.snappedPosition, {
      x: -0.625,
      y: -1.14,
      z: -1.72,
    });
  });

  it("marks the next width step unavailable when expanding would push the cabinet off its current wall span", () => {
    const resizeOutcome = getCupboardWidthStepOutcome({
      cupboard: createResizableCupboardFixture({
        id: 12,
        activeVariantId: "300x720x560",
        position: { x: 1.85, y: -1.14, z: -1.72 },
      }),
      direction: "next",
      roomBounds,
      cupboards: [],
    });

    expect(resizeOutcome.isAvailable).toBe(false);
    expect(resizeOutcome.validation).toMatchObject({
      isValid: true,
      reason: null,
      wall: BACK_WALL_ID,
      collidingCupboardIds: [],
    });
    expectPositionToMatch(resizeOutcome.validation.snappedPosition, {
      x: 1.825,
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
