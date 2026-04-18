import React from "react";

import SelectedCupboardWidthControls from "./SelectedCupboardWidthControls";
import { CUPBOARD_RESIZE_SIDES } from "../model/placement";
import { useCupboards } from "../state/CupboardProvider";

jest.mock("../state/CupboardProvider", () => ({
  useCupboards: jest.fn(),
}));

const createCupboardFixture = () => ({
  id: 7,
  size: [0.6, 0.72, 0.56],
  position: { x: 0.2, y: -1.14, z: -1.72 },
  rotation: 0,
  availableWidths: [300, 350, 400],
});

const getRenderedHandles = (cupboard = createCupboardFixture()) => {
  const tree = SelectedCupboardWidthControls({ cupboard });

  if (!tree) {
    return [];
  }

  return React.Children.toArray(tree.props.children);
};

describe("SelectedCupboardWidthControls", () => {
  beforeEach(() => {
    useCupboards.mockReturnValue({
      activeResize: null,
      isMoveActive: false,
      isPlacementActive: false,
      isResizeActive: false,
      startCupboardResize: jest.fn(),
      startCupboardMove: jest.fn(),
    });
  });

  it("renders left and right resize handles for cabinets with multiple supported widths", () => {
    const handles = getRenderedHandles();

    expect(handles).toHaveLength(2);
    expect(handles[0].props.side).toBe(CUPBOARD_RESIZE_SIDES.LEFT);
    expect(handles[1].props.side).toBe(CUPBOARD_RESIZE_SIDES.RIGHT);
  });

  it("starts resize mode from a handle pointer-down and stops the event from reaching move mode", () => {
    const startCupboardResize = jest.fn();
    const startCupboardMove = jest.fn();

    useCupboards.mockReturnValue({
      activeResize: null,
      isMoveActive: false,
      isPlacementActive: false,
      isResizeActive: false,
      startCupboardResize,
      startCupboardMove,
    });

    const cupboard = createCupboardFixture();
    const [leftHandle] = getRenderedHandles(cupboard);
    const renderedHandle = leftHandle.type(leftHandle.props);
    const event = {
      button: 0,
      stopPropagation: jest.fn(),
      nativeEvent: {
        preventDefault: jest.fn(),
        stopImmediatePropagation: jest.fn(),
      },
    };

    renderedHandle.props.onPointerDown(event);

    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    expect(event.nativeEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.nativeEvent.stopImmediatePropagation).toHaveBeenCalledTimes(1);
    expect(startCupboardResize).toHaveBeenCalledWith(cupboard.id, CUPBOARD_RESIZE_SIDES.LEFT);
    expect(startCupboardMove).not.toHaveBeenCalled();
  });

  it("hides resize handles when the selected cabinet has no alternative width variants", () => {
    const tree = SelectedCupboardWidthControls({
      cupboard: {
        ...createCupboardFixture(),
        availableWidths: [600],
      },
    });

    expect(tree).toBeNull();
  });
});
