import { cupboardReducer, initialCupboardState } from "./cupboardReducer";
import { BACK_WALL_ID, LEFT_WALL_ID, RIGHT_WALL_ID } from "../model/placement";

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
          catalogId: "base-600",
          roomBounds,
        },
      },
    );

    expect(nextState.selectedCupboardId).toBeNull();
    expect(nextState.placementPreview).toMatchObject({
      catalogId: "base-600",
      name: "Base cabinet 600",
      wall: null,
      isValid: false,
    });
    expectPositionToMatch(nextState.placementPreview.position, {
      x: 0,
      y: -1.14,
      z: -1.72,
    });
  });

  it("updates the preview position from valid back-wall pointer movement", () => {
    const startedState = cupboardReducer(initialCupboardState, {
      type: "START_PLACEMENT_PREVIEW",
      payload: {
        catalogId: "drawer-900",
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
      x: -1.55,
      y: -1.14,
      z: -1.72,
    });
    expect(nextState.placementPreview).toMatchObject({
      wall: BACK_WALL_ID,
      isValid: true,
    });
  });

  it("updates the preview position and rotation from valid left-wall pointer movement", () => {
    const startedState = cupboardReducer(initialCupboardState, {
      type: "START_PLACEMENT_PREVIEW",
      payload: {
        catalogId: "drawer-900",
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
      z: -1.55,
    });
    expect(nextState.placementPreview).toMatchObject({
      wall: LEFT_WALL_ID,
      isValid: true,
    });
    expect(nextState.placementPreview.rotation).toBeCloseTo(Math.PI / 2);
  });

  it("marks the preview invalid when the pointer leaves the back wall", () => {
    const startedState = cupboardReducer(initialCupboardState, {
      type: "START_PLACEMENT_PREVIEW",
      payload: {
        catalogId: "drawer-900",
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
      isValid: false,
    });
    expectPositionToMatch(nextState.placementPreview.position, validState.placementPreview.position);
  });

  it("commits a valid preview into a placed back-wall cupboard on drop", () => {
    const startedState = cupboardReducer(initialCupboardState, {
      type: "START_PLACEMENT_PREVIEW",
      payload: {
        catalogId: "drawer-900",
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
      catalogId: "drawer-900",
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
        catalogId: "drawer-900",
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
      catalogId: "drawer-900",
      wall: RIGHT_WALL_ID,
    });
    expect(nextState.cupboards[0].rotation).toBeCloseTo(Math.PI * 1.5);
    expectPositionToMatch(nextState.cupboards[0].position, {
      x: 1.72,
      y: -1.14,
      z: 0.75,
    });
  });

  it("rejects an invalid preview on drop", () => {
    const startedState = cupboardReducer(initialCupboardState, {
      type: "START_PLACEMENT_PREVIEW",
      payload: {
        catalogId: "base-600",
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
        catalogId: "tall-600",
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
            catalogId: "drawer-900",
            name: "Drawer base 900",
            description: "Drawer",
            dimensionsMm: [900, 720, 560],
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
