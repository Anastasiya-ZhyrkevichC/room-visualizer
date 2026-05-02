import { resolveStarterCabinetInstance } from "./catalog";
import {
  getDefaultProjectCustomisation,
  resolveCompatibleOverrideOrFallback,
  resolveEffectiveCustomisation,
} from "./customization";

describe("customization model", () => {
  it("inherits project defaults for cabinets without overrides", () => {
    const projectCustomisation = getDefaultProjectCustomisation();
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

    expect(resolveEffectiveCustomisation(cupboard, projectCustomisation)).toMatchObject({
      effectiveCustomisation: {
        carcassId: "carcass-standard-white",
        facadeId: "facade-white-matte",
        handleId: "handle-brushed-steel",
        accessoryPresetId: "preset-standard",
        accessoryIds: [],
      },
      sources: {
        carcass: "project",
        facade: "project",
        handle: "project",
        accessoryPreset: "project",
        accessories: "project-preset",
      },
    });
  });

  it("keeps valid overrides and prunes incompatible accessory choices", () => {
    const cupboard = {
      ...resolveStarterCabinetInstance({
        catalogId: "base-double-door",
        activeVariantId: "300x720x560",
      }),
      customisation: {
        carcassId: "carcass-oak-smoke",
        facadeId: "facade-oak-matte",
        handleId: "handle-black-rail",
        accessoryPresetId: null,
        accessoryIds: ["accessory-cutlery-insert", "accessory-waste-bin"],
      },
    };

    expect(resolveCompatibleOverrideOrFallback(cupboard, cupboard.customisation)).toEqual({
      carcassId: "carcass-oak-smoke",
      facadeId: "facade-oak-matte",
      handleId: "handle-black-rail",
      accessoryPresetId: null,
      accessoryIds: [],
    });
  });
});
