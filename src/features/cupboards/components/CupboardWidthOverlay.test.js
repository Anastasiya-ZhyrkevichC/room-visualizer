import React from "react";

import CupboardWidthOverlay, {
  DIMENSION_LABEL_LIFT,
  DIMENSION_Y_OFFSET,
  DIMENSION_WALL_INSET,
  getWidthOverlayGeometry,
} from "./CupboardWidthOverlay";

const createOverlayProps = (overrides = {}) => ({
  position: { x: 0.2, y: -1.14, z: -1.72 },
  rotation: 0,
  size: [0.6, 0.72, 0.56],
  widthMm: 600,
  isActive: true,
  ...overrides,
});

const getRenderedChildren = (overrides = {}) => {
  const tree = CupboardWidthOverlay(createOverlayProps(overrides));

  if (!tree) {
    return [];
  }

  return React.Children.toArray(tree.props.children);
};

describe("CupboardWidthOverlay", () => {
  it("formats the label from the explicit width when available", () => {
    const [, , , billboard] = getRenderedChildren({
      widthMm: 725.2,
      size: [0.6, 0.72, 0.56],
    });
    const [, text] = React.Children.toArray(billboard.props.children);

    expect(text.props.children).toBe("725 mm");
  });

  it("falls back to the rendered cabinet width when explicit millimeters are missing", () => {
    const [, , , billboard] = getRenderedChildren({
      widthMm: undefined,
      size: [0.4, 0.72, 0.56],
    });
    const [, text] = React.Children.toArray(billboard.props.children);

    expect(text.props.children).toBe("400 mm");
  });

  it("returns null when the cupboard size is missing or malformed", () => {
    expect(CupboardWidthOverlay(createOverlayProps({ size: null }))).toBeNull();
    expect(CupboardWidthOverlay(createOverlayProps({ size: [0.6, 0.72] }))).toBeNull();
    expect(CupboardWidthOverlay(createOverlayProps({ size: [NaN, 0.72, 0.56] }))).toBeNull();
  });

  it("derives local overlay endpoints from the cabinet width, height, and wall depth", () => {
    const geometry = getWidthOverlayGeometry([0.8, 0.72, 0.6]);

    expect(geometry.startPoint).toEqual([-0.4, 0.36 + DIMENSION_Y_OFFSET, -0.3 + DIMENSION_WALL_INSET]);
    expect(geometry.endPoint).toEqual([0.4, 0.36 + DIMENSION_Y_OFFSET, -0.3 + DIMENSION_WALL_INSET]);
    expect(geometry.labelPosition).toEqual([
      0,
      0.36 + DIMENSION_Y_OFFSET + DIMENSION_LABEL_LIFT,
      -0.3 + DIMENSION_WALL_INSET,
    ]);
  });
});
