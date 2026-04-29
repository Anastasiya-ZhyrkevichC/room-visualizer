import {
  HEIGHT_OPTIONS_REFERENCE_NOTE,
  formatCatalogModulePrice,
  formatModuleDepth,
  formatModuleFamily,
  formatModuleHeightOptions,
  formatModuleWidthOptions,
  formatSelectionResizeHint,
  formatTableTopDimensions,
  formatTableTopLabel,
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
    ).toBe("With current defaults from $160");

    expect(
      formatCatalogModulePrice({
        startingPrice: 680,
        maxPrice: 680,
        price: 680,
      }),
    ).toBe("With current defaults $680");
  });

  it("shares variable-size guidance between stage messaging and selection details", () => {
    expect(HEIGHT_OPTIONS_REFERENCE_NOTE).toBe("Height options are display-only for now");
    expect(formatSelectionResizeHint("back wall")).toBe(
      "Drag the in-scene side handles to resize through supported widths, or drag the cabinet body to reposition it along the back wall.",
    );
  });

  it("formats derived tabletop labels and dimensions for planner summary rows", () => {
    expect(
      formatTableTopDimensions({
        length: 1.8,
        depth: 0.62,
        thickness: 0.04,
      }),
    ).toBe("1800 x 620 x 40 mm");

    expect(
      formatTableTopLabel({
        wall: "left",
      }),
    ).toBe("Left wall");

    expect(
      formatTableTopDimensions({
        length: 1.2,
        depth: null,
        thickness: 0.04,
      }),
    ).toBe("");
  });
});
