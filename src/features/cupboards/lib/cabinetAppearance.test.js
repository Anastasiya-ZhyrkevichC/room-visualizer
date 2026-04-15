import {
  getCabinetOutlineColor,
  getCabinetOutlineScale,
  getKitchenCabinetTheme,
  getSimpleCupboardMaterialProps,
} from "./cabinetAppearance";

describe("cabinet appearance helpers", () => {
  it("prioritizes invalid outline styling over ghost and moving states", () => {
    expect(getCabinetOutlineColor({ isGhost: true, isInvalid: true })).toBe("#ff7f77");
    expect(getCabinetOutlineColor({ isMoving: true, isSelected: true, isInvalid: true })).toBe("#b42318");
    expect(getCabinetOutlineScale({ isGhost: true, isInvalid: true })).toBeCloseTo(1.035);
    expect(getCabinetOutlineScale({ isInvalid: true })).toBeCloseTo(1.025);
  });

  it("returns a distinct invalid box material for ghost and active cabinets", () => {
    expect(getSimpleCupboardMaterialProps({ isGhost: true, isInvalid: true })).toMatchObject({
      color: "#d86d63",
      emissive: "#9f2124",
      emissiveIntensity: 0.3,
      opacity: 0.42,
      transparent: true,
    });

    expect(getSimpleCupboardMaterialProps({ isMoving: true, isSelected: true, isInvalid: true })).toMatchObject({
      color: "#c85f58",
      emissive: "#8f1f25",
      emissiveIntensity: 0.24,
      opacity: 1,
      transparent: false,
    });
  });

  it("returns a distinct invalid cabinet theme for ghost and active cabinets", () => {
    expect(getKitchenCabinetTheme({ isGhost: true, isInvalid: true })).toMatchObject({
      bodyColor: "#dd7267",
      emissiveColor: "#9f2124",
      emissiveIntensity: 0.3,
      opacity: 0.42,
      transparent: true,
    });

    expect(getKitchenCabinetTheme({ isMoving: true, isSelected: true, isInvalid: true })).toMatchObject({
      bodyColor: "#c96059",
      emissiveColor: "#8f1f25",
      emissiveIntensity: 0.24,
      opacity: 1,
      transparent: false,
    });
  });
});
