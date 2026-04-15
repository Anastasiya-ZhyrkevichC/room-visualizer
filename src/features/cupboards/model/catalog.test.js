import {
  defaultOpenStarterCabinetGroupIds,
  getStarterCabinetFamilyLabel,
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
        cabinetIds: ["base-600"],
      },
      {
        id: "base-drawers",
        cabinetIds: ["drawer-900"],
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
        cabinetIds: ["tall-600"],
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
});
