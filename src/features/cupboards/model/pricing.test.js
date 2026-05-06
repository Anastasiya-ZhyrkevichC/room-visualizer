import { resolveStarterCabinetInstance } from "./catalog";
import { getDefaultProjectCustomisation } from "./customization";
import { calculateCupboardPriceBreakdown } from "./pricing";

describe("pricing model", () => {
  it("calculates a live estimate from body price plus customisation surcharges", () => {
    const cupboard = {
      ...resolveStarterCabinetInstance({
        catalogId: "base-double-door",
        activeVariantId: "300x720x560",
      }),
      customisation: {
        carcassId: null,
        facadeId: null,
        handleId: null,
        accessoryPresetId: null,
        accessoryIds: null,
      },
    };

    expect(calculateCupboardPriceBreakdown(cupboard, getDefaultProjectCustomisation())).toMatchObject({
      bodyPrice: 481,
      carcassPrice: 0,
      facadePrice: 0,
      handlePrice: 24,
      accessoriesPrice: 0,
      totalPrice: 505,
      currency: "USD",
    });
  });

  it("charges facade bands, per-handle units, and custom accessory items together", () => {
    const cupboard = {
      ...resolveStarterCabinetInstance({
        catalogId: "base-three-drawer",
        activeVariantId: "900x720x560",
      }),
      customisation: {
        carcassId: null,
        facadeId: "facade-oak-matte",
        handleId: "handle-black-rail",
        accessoryPresetId: null,
        accessoryIds: ["accessory-cutlery-insert", "accessory-spice-insert"],
      },
    };

    expect(calculateCupboardPriceBreakdown(cupboard, getDefaultProjectCustomisation())).toMatchObject({
      bodyPrice: 838,
      carcassPrice: 0,
      facadePrice: 65,
      handlePrice: 54,
      accessoriesPrice: 57,
      totalPrice: 1014,
      currency: "USD",
    });
  });
});
