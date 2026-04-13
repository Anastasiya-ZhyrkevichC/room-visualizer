import { resolveCabinetModel } from "./renderModel";

describe("cabinet render model", () => {
  it("uses drawer defaults for drawer cabinets", () => {
    expect(resolveCabinetModel("drawer")).toMatchObject({
      shelfCount: 0,
      front: {
        type: "drawers",
        drawerCount: 3,
        handle: {
          orientation: "horizontal",
        },
      },
      legs: {
        enabled: true,
      },
    });
  });

  it("merges facade overrides without losing category defaults", () => {
    expect(
      resolveCabinetModel("base", {
        front: {
          hasFacade: false,
          handle: null,
        },
        legs: {
          heightMm: 120,
        },
      }),
    ).toMatchObject({
      shelfCount: 1,
      front: {
        type: "doubleDoor",
        hasFacade: false,
        handle: null,
      },
      legs: {
        enabled: true,
        heightMm: 120,
      },
    });
  });

  it("keeps tall cabinet defaults legless", () => {
    expect(resolveCabinetModel("tall").legs).toBeNull();
  });
});
