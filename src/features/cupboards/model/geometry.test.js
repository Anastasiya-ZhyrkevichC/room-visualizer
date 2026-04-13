import {
  ROTATION_STEP,
  getCupboardFootprint,
  getCupboardRotationDegrees,
  getNormalizedRotation,
} from "./geometry";

describe("cupboard geometry", () => {
  it("normalizes negative rotations", () => {
    expect(getNormalizedRotation(-ROTATION_STEP)).toBeCloseTo(Math.PI * 1.5);
  });

  it("swaps footprint width and depth on quarter turns", () => {
    expect(getCupboardFootprint([0.6, 0.72, 0.56], 0)).toEqual({
      width: 0.6,
      depth: 0.56,
    });

    expect(getCupboardFootprint([0.6, 0.72, 0.56], ROTATION_STEP)).toEqual({
      width: 0.56,
      depth: 0.6,
    });
  });

  it("converts rotations to degrees", () => {
    expect(getCupboardRotationDegrees(ROTATION_STEP * 3)).toBe(270);
  });
});
