import {
  defaultOpenStarterCabinetGroupIds,
  starterCabinetCatalogGroups,
  starterCabinetUsageGroups,
} from "./catalog";

describe("starter cabinet catalog grouping", () => {
  it("keeps usage groups in a stable kitchen-first order", () => {
    expect(starterCabinetUsageGroups.map((group) => group.id)).toEqual(["base", "drawer", "wall", "tall", "corner"]);
  });

  it("nests starter modules under their matching usage group", () => {
    expect(
      starterCabinetCatalogGroups.map((group) => ({
        id: group.id,
        cabinetIds: group.cabinets.map((cabinet) => cabinet.id),
      })),
    ).toEqual([
      {
        id: "base",
        cabinetIds: ["base-600"],
      },
      {
        id: "drawer",
        cabinetIds: ["drawer-900"],
      },
      {
        id: "wall",
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
    expect(defaultOpenStarterCabinetGroupIds).toEqual(["base", "drawer", "tall"]);
  });
});
