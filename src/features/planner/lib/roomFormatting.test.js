import {
  formatCatalogModulePrice,
  formatModuleDepth,
  formatModuleFamily,
  formatModuleHeightOptions,
  formatModuleWidthOptions,
} from "./roomFormatting";

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

  it("formats supported width and height options without duplicating UI logic", () => {
    expect(
      formatModuleWidthOptions({
        availableWidths: [600, 300, 450, 300],
      }),
    ).toBe("300 / 450 / 600 mm");

    expect(
      formatModuleHeightOptions({
        availableHeights: [2300, 2100],
      }),
    ).toBe("2100 / 2300 mm");
  });

  it("keeps secondary depth metadata and starting-price labels aligned with variable-size catalog rows", () => {
    expect(
      formatModuleDepth({
        depth: 560,
      }),
    ).toBe("560 mm");

    expect(
      formatCatalogModulePrice({
        startingPrice: 160,
        maxPrice: 240,
        price: 240,
      }),
    ).toBe("From $160");

    expect(
      formatCatalogModulePrice({
        startingPrice: 680,
        maxPrice: 680,
        price: 680,
      }),
    ).toBe("$680");
  });
});
