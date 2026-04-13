import {
  alignCupboardToBackWall,
  createCupboard,
  createInitialCupboardPosition,
  getAttachedCupboardPosition,
} from "./placement";

const roomBounds = {
  floor: -1.5,
  back: -2,
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
        name: "Base",
        description: "Base",
        dimensionsMm: [600, 720, 560],
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
});
