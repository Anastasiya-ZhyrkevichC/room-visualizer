export const CABINET_RENDER_MODES = Object.freeze({
  BOX: "box",
  FANCY: "fancy",
});

// Change this to `CABINET_RENDER_MODES.BOX` to render plain boxes instead of detailed cabinets.
export const plannerConfig = Object.freeze({
  cabinetRenderMode: CABINET_RENDER_MODES.BOX,
});

export const resolveCabinetRenderMode = (renderMode = plannerConfig.cabinetRenderMode) =>
  Object.values(CABINET_RENDER_MODES).includes(renderMode) ? renderMode : CABINET_RENDER_MODES.FANCY;
