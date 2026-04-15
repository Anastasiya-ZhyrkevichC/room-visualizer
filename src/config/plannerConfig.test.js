import { CABINET_RENDER_MODES, resolveCabinetRenderMode } from "./plannerConfig";

describe("planner config", () => {
  it("keeps box and fancy as the supported cabinet render modes", () => {
    expect(Object.values(CABINET_RENDER_MODES)).toEqual(["box", "fancy"]);
  });

  it("falls back to fancy rendering for unsupported values", () => {
    expect(resolveCabinetRenderMode("unknown-mode")).toBe(CABINET_RENDER_MODES.FANCY);
  });

  it("accepts the box render mode for plain cupboard meshes", () => {
    expect(resolveCabinetRenderMode(CABINET_RENDER_MODES.BOX)).toBe(CABINET_RENDER_MODES.BOX);
  });
});
