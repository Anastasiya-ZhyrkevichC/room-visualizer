import {
  alignCupboardToBackWall,
  getWallAlignedRotation,
  createPlacementPreview,
  createCupboard,
  createInitialCupboardPosition,
  getBackWallAlignedPreviewPosition,
  getFloorAlignedPreviewPosition,
  getAttachedCupboardPosition,
  getLeftWallAlignedPreviewPosition,
  getRightWallAlignedPreviewPosition,
  LEFT_WALL_ID,
  RIGHT_WALL_ID,
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
      price: 390,
      wall: null,
      isValid: false,
    });
    expectPositionToMatch(preview.position, {
      x: 0,
      y: -1.14,
      z: -1.72,
    });
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
