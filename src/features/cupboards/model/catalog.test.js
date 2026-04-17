import {
  defaultOpenStarterCabinetGroupIds,
  getStarterCabinet,
  getStarterCabinetFamilyLabel,
  resolveDefaultStarterCabinetVariant,
  resolveStarterCabinetWidthStep,
  starterCabinetCatalogGroups,
  starterCabinetCatalogFamilies,
} from "./catalog";

describe("starter cabinet catalog grouping", () => {
  it("keeps cabinet families in a stable kitchen-first order", () => {
    expect(starterCabinetCatalogFamilies.map((group) => group.id)).toEqual([
      "base-doors",
      "base-drawers",
      "wall-doors",
      "wall-lift-up",
      "tall",
      "corner",
    ]);
  });

  it("uses natural family labels for the browse tree", () => {
    expect(starterCabinetCatalogFamilies.map((group) => group.label)).toEqual([
      "Base cabinets with doors",
      "Base cabinets with drawers",
      "Wall cabinets with doors",
      "Lift-up wall cabinets",
      "Tall cabinets",
      "Corner cabinets",
    ]);
  });

  it("nests starter modules under their matching family group", () => {
    expect(
      starterCabinetCatalogGroups.map((group) => ({
        id: group.id,
        cabinetIds: group.cabinets.map((cabinet) => cabinet.id),
      })),
    ).toEqual([
      {
        id: "base-doors",
        cabinetIds: ["base-double-door"],
      },
      {
        id: "base-drawers",
        cabinetIds: ["base-three-drawer"],
      },
      {
        id: "wall-doors",
        cabinetIds: [],
      },
      {
        id: "wall-lift-up",
        cabinetIds: [],
      },
      {
        id: "tall",
        cabinetIds: ["tall-pantry"],
      },
      {
        id: "corner",
        cabinetIds: [],
      },
    ]);
  });

  it("opens populated groups by default and leaves empty families collapsed", () => {
    expect(defaultOpenStarterCabinetGroupIds).toEqual(["base-doors", "base-drawers", "tall"]);
  });

  it("falls back from legacy category ids to the matching visible family label", () => {
    expect(getStarterCabinetFamilyLabel({ category: "drawer" })).toBe("Base cabinets with drawers");
    expect(getStarterCabinetFamilyLabel({ category: "wall" })).toBe("Wall cabinets with doors");
  });

  it("stores width and height options on one cabinet definition without duplicating catalog rows", () => {
    const cabinet = getStarterCabinet("base-double-door");

    expect(cabinet.name).toBe("Double-door base cabinet");
    expect(cabinet.availableWidths).toEqual([300, 350, 400, 450, 600]);
    expect(cabinet.availableHeights).toEqual([720]);
    expect(cabinet.variants).toHaveLength(5);
    expect(cabinet.activeVariantId).toBe("600x720x560");
  });

  it("resolves the smallest valid size variant deterministically for each cabinet definition", () => {
    expect(resolveDefaultStarterCabinetVariant(getStarterCabinet("base-double-door"))).toMatchObject({
      id: "300x720x560",
      width: 300,
      height: 720,
      depth: 560,
      price: 160,
    });

    expect(resolveDefaultStarterCabinetVariant(getStarterCabinet("tall-pantry"))).toMatchObject({
      id: "600x2100x600",
      width: 600,
      height: 2100,
      depth: 600,
      price: 680,
    });
  });

  it("steps width options in order while keeping the current height and depth fixed", () => {
    expect(
      resolveStarterCabinetWidthStep(
        {
          catalogId: "base-double-door",
          activeVariantId: "350x720x560",
        },
        "previous",
      ),
    ).toMatchObject({
      catalogId: "base-double-door",
      activeVariantId: "300x720x560",
      width: 300,
      height: 720,
      depth: 560,
      price: 160,
    });

    expect(
      resolveStarterCabinetWidthStep(
        {
          catalogId: "base-double-door",
          activeVariantId: "350x720x560",
        },
        "next",
      ),
    ).toMatchObject({
      catalogId: "base-double-door",
      activeVariantId: "400x720x560",
      width: 400,
      height: 720,
      depth: 560,
      price: 190,
    });
  });

  it("returns no width step when the current cabinet has no alternate widths at its active height", () => {
    expect(
      resolveStarterCabinetWidthStep(
        {
          catalogId: "tall-pantry",
          activeVariantId: "600x2100x600",
        },
        "next",
      ),
    ).toBeNull();
  });
});
