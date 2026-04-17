import React from "react";

import CupboardRenderer from "./CupboardRenderer";
import SelectedCupboardWidthControls from "./SelectedCupboardWidthControls";
import { useCupboards } from "../state/CupboardProvider";

jest.mock("../state/CupboardProvider", () => ({
  useCupboards: jest.fn(),
}));

const createCupboardFixture = (id) => ({
  id,
  name: `Cabinet ${id}`,
  category: "base",
  model: {
    front: {
      type: "doubleDoor",
    },
  },
  size: [0.6, 0.72, 0.56],
  position: { x: id, y: -1.14, z: -1.72 },
  rotation: 0,
});

const createPlacementPreviewFixture = () => ({
  name: "Preview cabinet",
  category: "base",
  model: {
    front: {
      type: "doubleDoor",
    },
  },
  size: [0.6, 0.72, 0.56],
  position: { x: 0.4, y: -1.14, z: -1.72 },
  rotation: 0,
  validation: {
    isValid: false,
  },
});

const getRenderedElements = () => React.Children.toArray(CupboardRenderer().props.children);

describe("CupboardRenderer", () => {
  it("passes invalid state into the actively moved cupboard and ghost preview", () => {
    useCupboards.mockReturnValue({
      activeMove: {
        cupboardId: 1,
        validation: {
          isValid: false,
        },
      },
      cupboards: [createCupboardFixture(1), createCupboardFixture(2)],
      placementPreview: createPlacementPreviewFixture(),
      selectedCupboardId: 1,
      selectCupboard: jest.fn(),
      startCupboardMove: jest.fn(),
    });

    const [movingCupboard, idleCupboard, preview] = getRenderedElements();

    expect(movingCupboard.props).toMatchObject({
      isMoving: true,
      isSelected: true,
      isInvalid: true,
    });
    expect(idleCupboard.props).toMatchObject({
      isMoving: false,
      isInvalid: false,
    });
    expect(preview.props).toMatchObject({
      isInvalid: true,
    });
  });

  it("keeps valid movement and preview styling out of the invalid state", () => {
    useCupboards.mockReturnValue({
      activeMove: {
        cupboardId: 1,
        validation: {
          isValid: true,
        },
      },
      cupboards: [createCupboardFixture(1)],
      placementPreview: {
        ...createPlacementPreviewFixture(),
        validation: {
          isValid: true,
        },
      },
      selectedCupboardId: 1,
      selectCupboard: jest.fn(),
      startCupboardMove: jest.fn(),
    });

    const [movingCupboard, preview] = getRenderedElements();

    expect(movingCupboard.props.isInvalid).toBe(false);
    expect(preview.props.isInvalid).toBe(false);
  });

  it("renders width controls for the selected cupboard", () => {
    const selectedCupboard = createCupboardFixture(1);

    useCupboards.mockReturnValue({
      activeMove: null,
      cupboards: [selectedCupboard],
      placementPreview: null,
      selectedCupboard,
      selectedCupboardId: 1,
      selectCupboard: jest.fn(),
      startCupboardMove: jest.fn(),
    });

    const [cupboard, controls] = getRenderedElements();

    expect(cupboard.props.isSelected).toBe(true);
    expect(controls.type).toBe(SelectedCupboardWidthControls);
    expect(controls.props.cupboard).toBe(selectedCupboard);
  });
});
