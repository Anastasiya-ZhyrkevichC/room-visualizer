import { formatModuleFamily } from "./roomFormatting";

describe("room formatting", () => {
  it("prefers the explicit catalog family label when available", () => {
    expect(
      formatModuleFamily({
        catalogFamily: "wall-lift-up",
        category: "wall",
      }),
    ).toBe("Lift-up wall cabinets");
  });

  it("falls back from legacy category ids to the matching cabinet family label", () => {
    expect(
      formatModuleFamily({
        category: "drawer",
      }),
    ).toBe("Base cabinets with drawers");
  });
});
