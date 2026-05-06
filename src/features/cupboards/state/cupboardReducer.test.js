import { cupboardReducer, initialCupboardState } from "./cupboardReducer";
import {
  BACK_WALL_ID,
  CUPBOARD_RESIZE_SIDES,
  LEFT_WALL_ID,
  MAGNETIC_ATTACHMENT_EDGES,
  PLACEMENT_VALIDATION_REASONS,
  RIGHT_WALL_ID,
  SAME_WALL_MAGNETIC_TOLERANCE,
  getWallAlignedRotation,
} from "../model/placement";
import { resolveStarterCabinetInstance } from "../model/catalog";

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

describe("cupboard reducer placement preview", () => {
  it("starts preview mode with a ghost cabinet and clears selection", () => {
    const nextState = cupboardReducer(
      {
        ...initialCupboardState,
        selectedCupboardId: 12,
      },
      {
        type: "START_PLACEMENT_PREVIEW",
        payload: {
          catalogId: "base-double-door",
          roomBounds,
        },
      },
    );

    expect(nextState.selectedCupboardId).toBeNull();
    expect(nextState.placementPreview).toMatchObject({
      catalogId: "base-double-door",
      defaultVariantId: "300x720x560",
      activeVariantId: "300x720x560",
      name: "Double-door base cabinet",
      category: "base",
      catalogFamily: "base-doors",
      availableWidths: [300, 350, 400, 450, 600],
      availableHeights: [720],
      width: 300,
      price: 170,
      wall: null,
    });
    expectPositionToMatch(nextState.placementPreview.position, {
      x: 0,
      y: -1.14,
      z: -1.72,
    });
    expect(nextState.placementPreview.validation).toMatchObject({
      isValid: false,
      reason: PLACEMENT_VALIDATION_REASONS.UNSUPPORTED_WALL,
      wall: null,
      rotation: 0,
      collidingCupboardIds: [],
    });
  });

  it("updates the preview position from valid back-wall pointer movement", () => {
    const startedState = cupboardReducer(initialCupboardState, {
      type: "START_PLACEMENT_PREVIEW",
      payload: {
        catalogId: "base-three-drawer",
        roomBounds,
      },
    });

    const nextState = cupboardReducer(startedState, {
      type: "UPDATE_PLACEMENT_PREVIEW",
      payload: {
        wall: BACK_WALL_ID,
        point: {
          x: -3,
          y: 0.2,
        },
        roomBounds,
      },
    });

    expectPositionToMatch(nextState.placementPreview.position, {
      x: -1.7,
      y: -1.14,
      z: -1.72,
    });
    expect(nextState.placementPreview).toMatchObject({
      wall: BACK_WALL_ID,
    });
    expect(nextState.placementPreview.validation).toMatchObject({
      isValid: true,
      reason: null,
      wall: BACK_WALL_ID,
      rotation: 0,
      collidingCupboardIds: [],
    });
    expectPositionToMatch(nextState.placementPreview.validation.snappedPosition, nextState.placementPreview.position);
  });

  it("updates the preview position and rotation from valid left-wall pointer movement", () => {
    const startedState = cupboardReducer(initialCupboardState, {
      type: "START_PLACEMENT_PREVIEW",
      payload: {
        catalogId: "base-three-drawer",
        roomBounds,
      },
    });

    const nextState = cupboardReducer(startedState, {
      type: "UPDATE_PLACEMENT_PREVIEW",
      payload: {
        wall: LEFT_WALL_ID,
        point: {
          z: -3,
          y: 0.2,
        },
        roomBounds,
      },
    });

    expectPositionToMatch(nextState.placementPreview.position, {
      x: -1.72,
      y: -1.14,
      z: -1.7,
    });
    expect(nextState.placementPreview).toMatchObject({
      wall: LEFT_WALL_ID,
    });
    expect(nextState.placementPreview.rotation).toBeCloseTo(Math.PI / 2);
    expect(nextState.placementPreview.validation).toMatchObject({
      isValid: true,
      reason: null,
      wall: LEFT_WALL_ID,
      rotation: Math.PI / 2,
      collidingCupboardIds: [],
    });
  });

  it("keeps wall-cabinet previews mounted above the floor during placement updates", () => {
    const startedState = cupboardReducer(initialCupboardState, {
      type: "START_PLACEMENT_PREVIEW",
      payload: {
        catalogId: "wall-double-door",
        roomBounds,
      },
    });

    const nextState = cupboardReducer(startedState, {
      type: "UPDATE_PLACEMENT_PREVIEW",
      payload: {
        wall: BACK_WALL_ID,
        point: {
          x: 0.4,
          y: 0.2,
        },
        roomBounds,
      },
    });

    expect(nextState.placementPreview).toMatchObject({
      catalogId: "wall-double-door",
      category: "wall",
      wall: BACK_WALL_ID,
    });
    expectPositionToMatch(nextState.placementPreview.position, {
      x: 0.4,
      y: 0.14,
      z: -1.84,
    });
    expect(nextState.placementPreview.validation).toMatchObject({
      isValid: true,
      reason: null,
      wall: BACK_WALL_ID,
      rotation: 0,
      collidingCupboardIds: [],
    });
  });

  it("marks the preview invalid when the pointer leaves the back wall", () => {
    const startedState = cupboardReducer(initialCupboardState, {
      type: "START_PLACEMENT_PREVIEW",
      payload: {
        catalogId: "base-three-drawer",
        roomBounds,
      },
    });

    const validState = cupboardReducer(startedState, {
      type: "UPDATE_PLACEMENT_PREVIEW",
      payload: {
        wall: BACK_WALL_ID,
        point: {
          x: 0.4,
          y: 0,
        },
        roomBounds,
      },
    });

    const nextState = cupboardReducer(validState, {
      type: "UPDATE_PLACEMENT_PREVIEW",
      payload: {
        wall: null,
        point: null,
        roomBounds,
      },
    });

    expect(nextState.placementPreview).toMatchObject({
      wall: null,
    });
    expectPositionToMatch(nextState.placementPreview.position, validState.placementPreview.position);
    expect(nextState.placementPreview.validation).toMatchObject({
      isValid: false,
      reason: PLACEMENT_VALIDATION_REASONS.UNSUPPORTED_WALL,
      wall: null,
      rotation: 0,
      collidingCupboardIds: [],
    });
    expectPositionToMatch(nextState.placementPreview.validation.snappedPosition, validState.placementPreview.position);
  });

  it("commits a valid preview into a placed back-wall cupboard on drop", () => {
    const startedState = cupboardReducer(initialCupboardState, {
      type: "START_PLACEMENT_PREVIEW",
      payload: {
        catalogId: "base-three-drawer",
        roomBounds,
      },
    });

    const validState = cupboardReducer(startedState, {
      type: "UPDATE_PLACEMENT_PREVIEW",
      payload: {
        wall: BACK_WALL_ID,
        point: {
          x: 0.75,
          y: 0,
        },
        roomBounds,
      },
    });

    const nextState = cupboardReducer(validState, {
      type: "FINISH_PLACEMENT_PREVIEW",
    });

    expect(nextState.placementPreview).toBeNull();
    expect(nextState.selectedCupboardId).toBe(1);
    expect(nextState.nextCupboardId).toBe(2);
    expect(nextState.cupboards).toHaveLength(1);
    expect(nextState.cupboards[0]).toMatchObject({
      id: 1,
      catalogId: "base-three-drawer",
      defaultVariantId: "600x720x560",
      activeVariantId: "600x720x560",
      name: "Three-drawer base cabinet",
      category: "drawer",
      catalogFamily: "base-drawers",
      availableWidths: [600, 800, 900],
      availableHeights: [720],
      width: 600,
      price: 305,
      wall: BACK_WALL_ID,
    });
    expectPositionToMatch(nextState.cupboards[0].position, {
      x: 0.75,
      y: -1.14,
      z: -1.72,
    });
  });

  it("commits a valid preview into a placed right-wall cupboard on drop", () => {
    const startedState = cupboardReducer(initialCupboardState, {
      type: "START_PLACEMENT_PREVIEW",
      payload: {
        catalogId: "base-three-drawer",
        roomBounds,
      },
    });

    const validState = cupboardReducer(startedState, {
      type: "UPDATE_PLACEMENT_PREVIEW",
      payload: {
        wall: RIGHT_WALL_ID,
        point: {
          z: 0.75,
          y: 0,
        },
        roomBounds,
      },
    });

    const nextState = cupboardReducer(validState, {
      type: "FINISH_PLACEMENT_PREVIEW",
    });

    expect(nextState.placementPreview).toBeNull();
    expect(nextState.selectedCupboardId).toBe(1);
    expect(nextState.nextCupboardId).toBe(2);
    expect(nextState.cupboards).toHaveLength(1);
    expect(nextState.cupboards[0]).toMatchObject({
      id: 1,
      catalogId: "base-three-drawer",
      defaultVariantId: "600x720x560",
      activeVariantId: "600x720x560",
      name: "Three-drawer base cabinet",
      category: "drawer",
      catalogFamily: "base-drawers",
      availableWidths: [600, 800, 900],
      availableHeights: [720],
      width: 600,
      price: 305,
      wall: RIGHT_WALL_ID,
    });
    expect(nextState.cupboards[0].rotation).toBeCloseTo(Math.PI * 1.5);
    expectPositionToMatch(nextState.cupboards[0].position, {
      x: 1.72,
      y: -1.14,
      z: 0.75,
    });
  });

  it("commits the held flush position when a same-wall preview is released inside the magnetic buffer", () => {
    const startedState = cupboardReducer(
      {
        ...initialCupboardState,
        cupboards: [createPlacedCupboardFixture({ id: 10 })],
        nextCupboardId: 11,
      },
      {
        type: "START_PLACEMENT_PREVIEW",
        payload: {
          catalogId: "base-double-door",
          roomBounds,
        },
      },
    );

    const overshoot = SAME_WALL_MAGNETIC_TOLERANCE / 2;
    const heldState = cupboardReducer(startedState, {
      type: "UPDATE_PLACEMENT_PREVIEW",
      payload: {
        wall: BACK_WALL_ID,
        point: {
          x: 0.6 - overshoot,
          y: 0,
        },
        roomBounds,
      },
    });

    expect(heldState.placementPreview.validation).toMatchObject({
      isValid: true,
      reason: null,
      wall: BACK_WALL_ID,
      rotation: 0,
      collidingCupboardIds: [],
      isMagneticallySnapped: true,
      magneticAttachment: {
        cupboardId: 10,
        edge: MAGNETIC_ATTACHMENT_EDGES.END,
      },
    });
    expectPositionToMatch(heldState.placementPreview.position, {
      x: 0.6,
      y: -1.14,
      z: -1.72,
    });
    expectPositionToMatch(heldState.placementPreview.validation.rawSnappedPosition, {
      x: 0.6 - overshoot,
      y: -1.14,
      z: -1.72,
    });

    const nextState = cupboardReducer(heldState, {
      type: "FINISH_PLACEMENT_PREVIEW",
    });

    expect(nextState.placementPreview).toBeNull();
    expect(nextState.selectedCupboardId).toBe(11);
    expect(nextState.cupboards).toHaveLength(2);
    expectPositionToMatch(nextState.cupboards[1].position, {
      x: 0.6,
      y: -1.14,
      z: -1.72,
    });
  });

  it("rejects an overlapping same-wall preview and does not place it on drop", () => {
    const startedState = cupboardReducer(
      {
        ...initialCupboardState,
        cupboards: [createPlacedCupboardFixture({ id: 10 })],
        nextCupboardId: 11,
      },
      {
        type: "START_PLACEMENT_PREVIEW",
        payload: {
          catalogId: "base-double-door",
          roomBounds,
        },
      },
    );

    const overlappingState = cupboardReducer(startedState, {
      type: "UPDATE_PLACEMENT_PREVIEW",
      payload: {
        wall: BACK_WALL_ID,
        point: {
          x: 0.4,
          y: 0,
        },
        roomBounds,
      },
    });

    expect(overlappingState.placementPreview.validation).toMatchObject({
      isValid: false,
      reason: PLACEMENT_VALIDATION_REASONS.OVERLAP,
      wall: BACK_WALL_ID,
      rotation: 0,
      collidingCupboardIds: [10],
    });
    expectPositionToMatch(overlappingState.placementPreview.position, {
      x: 0.4,
      y: -1.14,
      z: -1.72,
    });

    const nextState = cupboardReducer(overlappingState, {
      type: "FINISH_PLACEMENT_PREVIEW",
    });

    expect(nextState.placementPreview).toBeNull();
    expect(nextState.cupboards).toHaveLength(1);
    expect(nextState.cupboards[0].id).toBe(10);
    expect(nextState.selectedCupboardId).toBeNull();
  });

  it("starts preview mode from an explicitly selected variant when one is provided", () => {
    const nextState = cupboardReducer(
      {
        ...initialCupboardState,
        selectedCupboardId: 4,
      },
      {
        type: "START_PLACEMENT_PREVIEW",
        payload: {
          catalogId: "tall-pantry",
          variantId: "600x2300x600",
          roomBounds,
        },
      },
    );

    expect(nextState.selectedCupboardId).toBeNull();
    expect(nextState.placementPreview).toMatchObject({
      catalogId: "tall-pantry",
      defaultVariantId: "600x2100x600",
      activeVariantId: "600x2300x600",
      width: 600,
      height: 2300,
      depth: 600,
      price: 720,
    });
    expectPositionToMatch(nextState.placementPreview.position, {
      x: 0,
      y: -0.35,
      z: -1.7,
    });
  });

  it("rejects a cross-wall preview that intersects a cabinet at the corner", () => {
    const startedState = cupboardReducer(
      {
        ...initialCupboardState,
        cupboards: [
          createPlacedCupboardFixture({
            id: 10,
            wall: LEFT_WALL_ID,
            position: { x: -1.72, y: -1.14, z: -1.55 },
            rotation: getWallAlignedRotation(LEFT_WALL_ID),
          }),
        ],
        nextCupboardId: 11,
      },
      {
        type: "START_PLACEMENT_PREVIEW",
        payload: {
          catalogId: "base-three-drawer",
          roomBounds,
        },
      },
    );

    const cornerCollisionState = cupboardReducer(startedState, {
      type: "UPDATE_PLACEMENT_PREVIEW",
      payload: {
        wall: BACK_WALL_ID,
        point: {
          x: -2,
          y: 0,
        },
        roomBounds,
      },
    });

    expect(cornerCollisionState.placementPreview.validation).toMatchObject({
      isValid: false,
      reason: PLACEMENT_VALIDATION_REASONS.CORNER_COLLISION,
      wall: BACK_WALL_ID,
      rotation: 0,
      collidingCupboardIds: [10],
    });
    expectPositionToMatch(cornerCollisionState.placementPreview.position, {
      x: -1.7,
      y: -1.14,
      z: -1.72,
    });

    const nextState = cupboardReducer(cornerCollisionState, {
      type: "FINISH_PLACEMENT_PREVIEW",
    });

    expect(nextState.placementPreview).toBeNull();
    expect(nextState.cupboards).toHaveLength(1);
    expect(nextState.cupboards[0].id).toBe(10);
    expect(nextState.selectedCupboardId).toBeNull();
  });

  it("rejects an invalid preview on drop", () => {
    const startedState = cupboardReducer(initialCupboardState, {
      type: "START_PLACEMENT_PREVIEW",
      payload: {
        catalogId: "base-double-door",
        roomBounds,
      },
    });

    const nextState = cupboardReducer(startedState, {
      type: "FINISH_PLACEMENT_PREVIEW",
    });

    expect(nextState.placementPreview).toBeNull();
    expect(nextState.cupboards).toHaveLength(0);
    expect(nextState.selectedCupboardId).toBeNull();
  });

  it("cancels preview mode cleanly", () => {
    const startedState = cupboardReducer(initialCupboardState, {
      type: "START_PLACEMENT_PREVIEW",
      payload: {
        catalogId: "tall-pantry",
        roomBounds,
      },
    });

    const nextState = cupboardReducer(startedState, {
      type: "CANCEL_PLACEMENT_PREVIEW",
    });

    expect(nextState.placementPreview).toBeNull();
    expect(nextState.nextCupboardId).toBe(1);
  });

  it("keeps a rotated side-wall cupboard attached to its wall", () => {
    const nextState = cupboardReducer(
      {
        ...initialCupboardState,
        cupboards: [
          {
            id: 1,
            catalogId: "base-three-drawer",
            name: "Three-drawer base cabinet",
            category: "drawer",
            width: 900,
            height: 720,
            depth: 560,
            price: 390,
            size: [0.9, 0.72, 0.56],
            position: {
              x: -1.72,
              y: -1.14,
              z: 0.25,
            },
            rotation: Math.PI / 2,
            wall: LEFT_WALL_ID,
          },
        ],
        selectedCupboardId: 1,
      },
      {
        type: "ROTATE_SELECTED_CUPBOARD",
        payload: {
          roomBounds,
        },
      },
    );

    expect(nextState.cupboards[0].rotation).toBeCloseTo(Math.PI);
    expectPositionToMatch(nextState.cupboards[0].position, {
      x: -1.55,
      y: -1.14,
      z: 0.25,
    });
  });
});

describe("cupboard reducer width stepping", () => {
  it("updates the selected cabinet to the next supported width from the right edge when the resized cabinet fits in place", () => {
    const nextState = cupboardReducer(
      {
        ...initialCupboardState,
        cupboards: [createResizableCupboardFixture()],
        selectedCupboardId: 1,
        nextCupboardId: 2,
      },
      {
        type: "STEP_SELECTED_CUPBOARD_WIDTH",
        payload: {
          direction: "next",
          side: CUPBOARD_RESIZE_SIDES.RIGHT,
          roomBounds,
        },
      },
    );

    expect(nextState.selectedCupboardId).toBe(1);
    expect(nextState.cupboards[0]).toMatchObject({
      id: 1,
      catalogId: "base-double-door",
      activeVariantId: "350x720x560",
      width: 350,
      height: 720,
      depth: 560,
      price: 179,
      wall: BACK_WALL_ID,
    });
    expectPositionToMatch(nextState.cupboards[0].position, {
      x: 0.025,
      y: -1.14,
      z: -1.72,
    });
  });

  it("keeps the selected cabinet unchanged when the next right-edge width would overlap a neighbor", () => {
    const selectedCupboard = createResizableCupboardFixture({
      id: 10,
      activeVariantId: "300x720x560",
      position: { x: -0.6, y: -1.14, z: -1.72 },
    });
    const blockingNeighbor = createResizableCupboardFixture({
      id: 11,
      activeVariantId: "300x720x560",
      position: { x: -0.3, y: -1.14, z: -1.72 },
    });
    const nextState = cupboardReducer(
      {
        ...initialCupboardState,
        cupboards: [selectedCupboard, blockingNeighbor],
        selectedCupboardId: 10,
        nextCupboardId: 12,
      },
      {
        type: "STEP_SELECTED_CUPBOARD_WIDTH",
        payload: {
          direction: "next",
          side: CUPBOARD_RESIZE_SIDES.RIGHT,
          roomBounds,
        },
      },
    );

    expect(nextState.cupboards).toHaveLength(2);
    expect(nextState.cupboards[0]).toEqual(selectedCupboard);
    expect(nextState.cupboards[1]).toEqual(blockingNeighbor);
  });

  it("keeps the selected cabinet unchanged when the next right-edge width would push past the wall bounds", () => {
    const selectedCupboard = createResizableCupboardFixture({
      id: 12,
      activeVariantId: "300x720x560",
      position: { x: 1.85, y: -1.14, z: -1.72 },
    });
    const nextState = cupboardReducer(
      {
        ...initialCupboardState,
        cupboards: [selectedCupboard],
        selectedCupboardId: 12,
        nextCupboardId: 13,
      },
      {
        type: "STEP_SELECTED_CUPBOARD_WIDTH",
        payload: {
          direction: "next",
          side: CUPBOARD_RESIZE_SIDES.RIGHT,
          roomBounds,
        },
      },
    );

    expect(nextState.cupboards).toHaveLength(1);
    expect(nextState.cupboards[0]).toEqual(selectedCupboard);
    expect(nextState.selectedCupboardId).toBe(12);
  });
});

describe("cupboard reducer cabinet replacement", () => {
  it("replaces the selected cabinet with a new catalog module while keeping the same scene slot", () => {
    const selectedCupboard = createResizableCupboardFixture({
      id: 5,
      activeVariantId: "350x720x560",
      position: { x: 0.3, y: -1.14, z: -1.72 },
    });

    const nextState = cupboardReducer(
      {
        ...initialCupboardState,
        cupboards: [selectedCupboard],
        selectedCupboardId: 5,
        nextCupboardId: 6,
      },
      {
        type: "REPLACE_SELECTED_CUPBOARD",
        payload: {
          catalogId: "tall-pantry",
          roomBounds,
        },
      },
    );

    expect(nextState.selectedCupboardId).toBe(5);
    expect(nextState.cupboards).toHaveLength(1);
    expect(nextState.cupboards[0]).toMatchObject({
      id: 5,
      catalogId: "tall-pantry",
      activeVariantId: "600x2100x600",
      name: "Pantry tower",
      width: 600,
      height: 2100,
      depth: 600,
      price: 682,
      wall: BACK_WALL_ID,
    });
    expectPositionToMatch(nextState.cupboards[0].position, {
      x: 0.3,
      y: -0.45,
      z: -1.7,
    });
  });
});

describe("cupboard reducer resize mode", () => {
  it("starts resize mode with the selected cupboard snapshot and active side", () => {
    const nextState = cupboardReducer(
      {
        ...initialCupboardState,
        cupboards: [createResizableCupboardFixture()],
        selectedCupboardId: 1,
      },
      {
        type: "START_CUPBOARD_RESIZE",
        payload: {
          cupboardId: 1,
          side: CUPBOARD_RESIZE_SIDES.RIGHT,
        },
      },
    );

    expect(nextState.activeResize).toMatchObject({
      cupboardId: 1,
      wall: BACK_WALL_ID,
      side: CUPBOARD_RESIZE_SIDES.RIGHT,
    });
    expect(nextState.activeResize.initialCupboard).toMatchObject({
      id: 1,
      activeVariantId: "300x720x560",
      wall: BACK_WALL_ID,
    });
    expectPositionToMatch(nextState.activeResize.initialCupboard.position, {
      x: 0,
      y: -1.14,
      z: -1.72,
    });
    expect(nextState.activeResize.validation).toMatchObject({
      isValid: true,
      reason: null,
      wall: BACK_WALL_ID,
    });
  });

  it("updates the active resize live from the original fixed edge", () => {
    const resizingState = cupboardReducer(
      {
        ...initialCupboardState,
        cupboards: [createResizableCupboardFixture()],
        selectedCupboardId: 1,
      },
      {
        type: "START_CUPBOARD_RESIZE",
        payload: {
          cupboardId: 1,
          side: CUPBOARD_RESIZE_SIDES.RIGHT,
        },
      },
    );

    const nextState = cupboardReducer(resizingState, {
      type: "UPDATE_CUPBOARD_RESIZE",
      payload: {
        wall: BACK_WALL_ID,
        point: {
          x: 0.23,
          y: 0,
        },
        roomBounds,
      },
    });

    expect(nextState.activeResize).toMatchObject({
      cupboardId: 1,
      side: CUPBOARD_RESIZE_SIDES.RIGHT,
    });
    expect(nextState.activeResize.validation).toMatchObject({
      isValid: true,
      reason: null,
      wall: BACK_WALL_ID,
      collidingCupboardIds: [],
    });
    expect(nextState.cupboards[0]).toMatchObject({
      id: 1,
      activeVariantId: "400x720x560",
      width: 400,
      wall: BACK_WALL_ID,
    });
    expectPositionToMatch(nextState.cupboards[0].position, {
      x: 0.05,
      y: -1.14,
      z: -1.72,
    });
  });

  it("reverts the cupboard when resize mode finishes on an invalid wall-bounds enlargement", () => {
    const resizingState = cupboardReducer(
      {
        ...initialCupboardState,
        cupboards: [
          createResizableCupboardFixture({
            id: 12,
            position: { x: 1.85, y: -1.14, z: -1.72 },
          }),
        ],
        selectedCupboardId: 12,
      },
      {
        type: "START_CUPBOARD_RESIZE",
        payload: {
          cupboardId: 12,
          side: CUPBOARD_RESIZE_SIDES.RIGHT,
        },
      },
    );

    const invalidResizeState = cupboardReducer(resizingState, {
      type: "UPDATE_CUPBOARD_RESIZE",
      payload: {
        wall: BACK_WALL_ID,
        point: {
          x: 2.04,
          y: 0,
        },
        roomBounds,
      },
    });

    expect(invalidResizeState.activeResize.validation).toMatchObject({
      isValid: false,
      reason: PLACEMENT_VALIDATION_REASONS.WALL_BOUNDS,
      wall: BACK_WALL_ID,
      collidingCupboardIds: [],
    });
    expectPositionToMatch(invalidResizeState.cupboards[0].position, {
      x: 1.875,
      y: -1.14,
      z: -1.72,
    });

    const nextState = cupboardReducer(invalidResizeState, {
      type: "FINISH_CUPBOARD_RESIZE",
    });

    expect(nextState.activeResize).toBeNull();
    expect(nextState.cupboards[0]).toMatchObject({
      id: 12,
      activeVariantId: "300x720x560",
      width: 300,
    });
    expectPositionToMatch(nextState.cupboards[0].position, {
      x: 1.85,
      y: -1.14,
      z: -1.72,
    });
  });

  it("restores the original cupboard snapshot when resize mode is canceled", () => {
    const resizingState = cupboardReducer(
      {
        ...initialCupboardState,
        cupboards: [createResizableCupboardFixture()],
        selectedCupboardId: 1,
      },
      {
        type: "START_CUPBOARD_RESIZE",
        payload: {
          cupboardId: 1,
          side: CUPBOARD_RESIZE_SIDES.RIGHT,
        },
      },
    );

    const updatedState = cupboardReducer(resizingState, {
      type: "UPDATE_CUPBOARD_RESIZE",
      payload: {
        wall: BACK_WALL_ID,
        point: {
          x: 0.23,
          y: 0,
        },
        roomBounds,
      },
    });

    const nextState = cupboardReducer(updatedState, {
      type: "CANCEL_CUPBOARD_RESIZE",
    });

    expect(nextState.activeResize).toBeNull();
    expect(nextState.cupboards[0]).toMatchObject({
      id: 1,
      activeVariantId: "300x720x560",
      width: 300,
    });
    expectPositionToMatch(nextState.cupboards[0].position, {
      x: 0,
      y: -1.14,
      z: -1.72,
    });
  });
});

describe("cupboard reducer project import", () => {
  it("replaces planner cupboard state and resets transient interactions when a project is loaded", () => {
    const importedCupboards = [
      {
        ...createResizableCupboardFixture({
          id: 14,
          activeVariantId: "350x720x560",
          position: { x: -0.25, y: -1.14, z: -1.72 },
        }),
        isUnavailable: true,
        unavailableReason: "missing-catalog-item",
      },
      createResizableCupboardFixture({
        id: 21,
        activeVariantId: "600x720x560",
        position: { x: 0.4, y: -1.14, z: -1.72 },
      }),
    ];

    const nextState = cupboardReducer(
      {
        ...initialCupboardState,
        cupboards: [createResizableCupboardFixture()],
        placementPreview: {
          catalogId: "base-double-door",
        },
        activeMove: {
          cupboardId: 1,
        },
        activeResize: {
          cupboardId: 1,
        },
        selectedCupboardId: 1,
        nextCupboardId: 8,
      },
      {
        type: "LOAD_PROJECT",
        payload: {
          cupboards: importedCupboards,
        },
      },
    );

    expect(nextState.cupboards).toMatchObject(importedCupboards);
    expect(nextState.placementPreview).toBeNull();
    expect(nextState.activeMove).toBeNull();
    expect(nextState.activeResize).toBeNull();
    expect(nextState.selectedCupboardId).toBeNull();
    expect(nextState.nextCupboardId).toBe(22);
  });
});

describe("cupboard reducer moving placed cupboards", () => {
  const placedCupboardState = {
    ...initialCupboardState,
    cupboards: [
      {
        id: 1,
        catalogId: "base-three-drawer",
        name: "Three-drawer base cabinet",
        category: "drawer",
        width: 900,
        height: 720,
        depth: 560,
        price: 390,
        size: [0.9, 0.72, 0.56],
        position: {
          x: 0.25,
          y: -1.14,
          z: -1.72,
        },
        rotation: 0,
        wall: BACK_WALL_ID,
      },
      {
        id: 2,
        catalogId: "base-double-door",
        name: "Double-door base cabinet",
        category: "base",
        width: 600,
        height: 720,
        depth: 560,
        price: 240,
        size: [0.6, 0.72, 0.56],
        position: {
          x: -1.72,
          y: -1.14,
          z: 0.1,
        },
        rotation: Math.PI / 2,
        wall: LEFT_WALL_ID,
      },
    ],
    selectedCupboardId: 1,
    nextCupboardId: 3,
  };

  it("starts move mode for the selected cupboard and keeps its current wall", () => {
    const nextState = cupboardReducer(placedCupboardState, {
      type: "START_CUPBOARD_MOVE",
      payload: {
        cupboardId: 1,
      },
    });

    expect(nextState.selectedCupboardId).toBe(1);
    expect(nextState.activeMove).toMatchObject({
      cupboardId: 1,
      wall: BACK_WALL_ID,
    });
    expectPositionToMatch(nextState.activeMove.initialPosition, {
      x: 0.25,
      y: -1.14,
      z: -1.72,
    });
    expect(nextState.activeMove.validation).toMatchObject({
      isValid: true,
      reason: null,
      wall: BACK_WALL_ID,
      rotation: 0,
      collidingCupboardIds: [],
    });
  });

  it("updates a moved cupboard along its current wall while preserving alignment", () => {
    const movingState = cupboardReducer(placedCupboardState, {
      type: "START_CUPBOARD_MOVE",
      payload: {
        cupboardId: 2,
      },
    });

    const nextState = cupboardReducer(movingState, {
      type: "UPDATE_CUPBOARD_MOVE",
      payload: {
        wall: LEFT_WALL_ID,
        point: {
          z: 3,
          y: 0.2,
        },
        roomBounds,
      },
    });

    expect(nextState.activeMove).toMatchObject({
      cupboardId: 2,
      wall: LEFT_WALL_ID,
    });
    expect(nextState.cupboards[1].rotation).toBeCloseTo(Math.PI / 2);
    expectPositionToMatch(nextState.cupboards[1].position, {
      x: -1.72,
      y: -1.14,
      z: 1.7,
    });
    expect(nextState.activeMove.validation).toMatchObject({
      isValid: true,
      reason: null,
      wall: LEFT_WALL_ID,
      rotation: Math.PI / 2,
      collidingCupboardIds: [],
    });
    expectPositionToMatch(nextState.activeMove.validation.snappedPosition, nextState.cupboards[1].position);
  });

  it("reverts a moved cupboard when released overlapping another cupboard on the same wall", () => {
    const overlappingState = {
      ...initialCupboardState,
      cupboards: [
        createPlacedCupboardFixture({
          id: 1,
          position: { x: -0.8, y: -1.14, z: -1.72 },
        }),
        createPlacedCupboardFixture({
          id: 2,
          position: { x: 0.8, y: -1.14, z: -1.72 },
        }),
      ],
      selectedCupboardId: 1,
      nextCupboardId: 3,
    };

    const movingState = cupboardReducer(overlappingState, {
      type: "START_CUPBOARD_MOVE",
      payload: {
        cupboardId: 1,
      },
    });

    const invalidMoveState = cupboardReducer(movingState, {
      type: "UPDATE_CUPBOARD_MOVE",
      payload: {
        wall: BACK_WALL_ID,
        point: {
          x: 0.4,
          y: 0.2,
        },
        roomBounds,
      },
    });

    expect(invalidMoveState.activeMove.validation).toMatchObject({
      isValid: false,
      reason: PLACEMENT_VALIDATION_REASONS.OVERLAP,
      wall: BACK_WALL_ID,
      rotation: 0,
      collidingCupboardIds: [2],
    });
    expectPositionToMatch(invalidMoveState.cupboards[0].position, {
      x: 0.4,
      y: -1.14,
      z: -1.72,
    });

    const nextState = cupboardReducer(invalidMoveState, {
      type: "FINISH_CUPBOARD_MOVE",
    });

    expect(nextState.activeMove).toBeNull();
    expectPositionToMatch(nextState.cupboards[0].position, {
      x: -0.8,
      y: -1.14,
      z: -1.72,
    });
    expectPositionToMatch(nextState.cupboards[1].position, {
      x: 0.8,
      y: -1.14,
      z: -1.72,
    });
  });

  it("commits the held flush position when a moved cupboard is released inside the magnetic buffer", () => {
    const magneticMoveState = {
      ...initialCupboardState,
      cupboards: [
        createPlacedCupboardFixture({
          id: 1,
          position: { x: -0.8, y: -1.14, z: -1.72 },
        }),
        createPlacedCupboardFixture({
          id: 2,
          position: { x: 0.8, y: -1.14, z: -1.72 },
        }),
      ],
      selectedCupboardId: 1,
      nextCupboardId: 3,
    };

    const movingState = cupboardReducer(magneticMoveState, {
      type: "START_CUPBOARD_MOVE",
      payload: {
        cupboardId: 1,
      },
    });

    const overshoot = SAME_WALL_MAGNETIC_TOLERANCE / 2;
    const heldMoveState = cupboardReducer(movingState, {
      type: "UPDATE_CUPBOARD_MOVE",
      payload: {
        wall: BACK_WALL_ID,
        point: {
          x: -0.1 + overshoot,
          y: 0.2,
        },
        roomBounds,
      },
    });

    expect(heldMoveState.activeMove.validation).toMatchObject({
      isValid: true,
      reason: null,
      wall: BACK_WALL_ID,
      rotation: 0,
      collidingCupboardIds: [],
      isMagneticallySnapped: true,
      magneticAttachment: {
        cupboardId: 2,
        edge: MAGNETIC_ATTACHMENT_EDGES.START,
      },
    });
    expectPositionToMatch(heldMoveState.cupboards[0].position, {
      x: -0.1,
      y: -1.14,
      z: -1.72,
    });
    expectPositionToMatch(heldMoveState.activeMove.validation.rawSnappedPosition, {
      x: -0.1 + overshoot,
      y: -1.14,
      z: -1.72,
    });

    const nextState = cupboardReducer(heldMoveState, {
      type: "FINISH_CUPBOARD_MOVE",
    });

    expect(nextState.activeMove).toBeNull();
    expect(nextState.selectedCupboardId).toBe(1);
    expectPositionToMatch(nextState.cupboards[0].position, {
      x: -0.1,
      y: -1.14,
      z: -1.72,
    });
    expectPositionToMatch(nextState.cupboards[1].position, {
      x: 0.8,
      y: -1.14,
      z: -1.72,
    });
  });

  it("reverts a moved side-wall cupboard when it intersects a back-wall cabinet at the corner", () => {
    const cornerCollisionState = {
      ...initialCupboardState,
      cupboards: [
        createPlacedCupboardFixture({
          id: 1,
          wall: LEFT_WALL_ID,
          position: { x: -1.72, y: -1.14, z: 0.8 },
          rotation: getWallAlignedRotation(LEFT_WALL_ID),
        }),
        createPlacedCupboardFixture({
          id: 2,
          position: { x: -1.55, y: -1.14, z: -1.72 },
        }),
      ],
      selectedCupboardId: 1,
      nextCupboardId: 3,
    };

    const movingState = cupboardReducer(cornerCollisionState, {
      type: "START_CUPBOARD_MOVE",
      payload: {
        cupboardId: 1,
      },
    });

    const invalidMoveState = cupboardReducer(movingState, {
      type: "UPDATE_CUPBOARD_MOVE",
      payload: {
        wall: LEFT_WALL_ID,
        point: {
          z: -3,
          y: 0.2,
        },
        roomBounds,
      },
    });

    expect(invalidMoveState.activeMove.validation).toMatchObject({
      isValid: false,
      reason: PLACEMENT_VALIDATION_REASONS.CORNER_COLLISION,
      wall: LEFT_WALL_ID,
      rotation: Math.PI / 2,
      collidingCupboardIds: [2],
    });
    expectPositionToMatch(invalidMoveState.cupboards[0].position, {
      x: -1.72,
      y: -1.14,
      z: -1.55,
    });

    const nextState = cupboardReducer(invalidMoveState, {
      type: "FINISH_CUPBOARD_MOVE",
    });

    expect(nextState.activeMove).toBeNull();
    expectPositionToMatch(nextState.cupboards[0].position, {
      x: -1.72,
      y: -1.14,
      z: 0.8,
    });
    expectPositionToMatch(nextState.cupboards[1].position, {
      x: -1.55,
      y: -1.14,
      z: -1.72,
    });
  });

  it("reverts a moved cupboard to its original position when the release is invalid", () => {
    const movingState = cupboardReducer(placedCupboardState, {
      type: "START_CUPBOARD_MOVE",
      payload: {
        cupboardId: 1,
      },
    });

    const validMoveState = cupboardReducer(movingState, {
      type: "UPDATE_CUPBOARD_MOVE",
      payload: {
        wall: BACK_WALL_ID,
        point: {
          x: 1.4,
          y: 0.2,
        },
        roomBounds,
      },
    });

    const invalidMoveState = cupboardReducer(validMoveState, {
      type: "UPDATE_CUPBOARD_MOVE",
      payload: {
        wall: null,
        point: null,
        roomBounds,
      },
    });

    expect(invalidMoveState.activeMove).toMatchObject({
      cupboardId: 1,
    });
    expectPositionToMatch(invalidMoveState.cupboards[0].position, {
      x: 1.4,
      y: -1.14,
      z: -1.72,
    });
    expect(invalidMoveState.activeMove.validation).toMatchObject({
      isValid: false,
      reason: PLACEMENT_VALIDATION_REASONS.UNSUPPORTED_WALL,
      wall: null,
      rotation: 0,
      collidingCupboardIds: [],
    });
    expectPositionToMatch(invalidMoveState.activeMove.validation.snappedPosition, {
      x: 1.4,
      y: -1.14,
      z: -1.72,
    });

    const nextState = cupboardReducer(invalidMoveState, {
      type: "FINISH_CUPBOARD_MOVE",
    });

    expect(nextState.activeMove).toBeNull();
    expectPositionToMatch(nextState.cupboards[0].position, {
      x: 0.25,
      y: -1.14,
      z: -1.72,
    });
  });

  it("commits a valid moved cupboard position on release", () => {
    const movingState = cupboardReducer(placedCupboardState, {
      type: "START_CUPBOARD_MOVE",
      payload: {
        cupboardId: 1,
      },
    });

    const validMoveState = cupboardReducer(movingState, {
      type: "UPDATE_CUPBOARD_MOVE",
      payload: {
        wall: BACK_WALL_ID,
        point: {
          x: -1.45,
          y: 0.2,
        },
        roomBounds,
      },
    });

    const nextState = cupboardReducer(validMoveState, {
      type: "FINISH_CUPBOARD_MOVE",
    });

    expect(nextState.activeMove).toBeNull();
    expect(nextState.selectedCupboardId).toBe(1);
    expectPositionToMatch(nextState.cupboards[0].position, {
      x: -1.45,
      y: -1.14,
      z: -1.72,
    });
  });
});
