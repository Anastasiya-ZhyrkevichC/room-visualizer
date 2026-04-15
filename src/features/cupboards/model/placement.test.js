import {
  alignCupboardToBackWall,
  BACK_WALL_ID,
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
        id: "base-600",
        name: "Double-door base 600",
        category: "base",
        model: {
          front: {
            type: "doubleDoor",
          },
        },
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
        id: "drawer-900",
        name: "Three-drawer base 900",
        category: "drawer",
        model: {
          front: {
            type: "drawers",
            drawerCount: 3,
          },
        },
        width: 900,
        height: 720,
        depth: 560,
        price: 390,
        size: [0.9, 0.72, 0.56],
      },
      roomBounds,
    );

    expect(preview).toMatchObject({
      catalogId: "drawer-900",
      name: "Three-drawer base 900",
      category: "drawer",
      catalogFamily: "base-drawers",
      price: 390,
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
