import React from "react";

import CupboardRenderer from "./CupboardRenderer";
import CupboardWidthOverlay from "./CupboardWidthOverlay";
import SelectedCupboardWidthControls from "./SelectedCupboardWidthControls";
import { useCupboards } from "../state/CupboardProvider";

jest.mock("../state/CupboardProvider", () => ({
  useCupboards: jest.fn(),
}));

jest.mock("./CupboardWidthOverlay", () => jest.fn(() => null));

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
  width: 600,
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

const createBaseContext = (overrides = {}) => ({
  activeMove: null,
  activeResize: null,
  cupboards: [],
  placementPreview: null,
  selectedCupboard: null,
  selectedCupboardId: null,
  selectCupboard: jest.fn(),
  startCupboardMove: jest.fn(),
  ...overrides,
});

describe("CupboardRenderer", () => {
  it("passes invalid state into the actively moved cupboard and ghost preview", () => {
    useCupboards.mockReturnValue(
      createBaseContext({
        activeMove: {
          cupboardId: 1,
          validation: {
            isValid: false,
          },
        },
        cupboards: [createCupboardFixture(1), createCupboardFixture(2)],
        placementPreview: createPlacementPreviewFixture(),
        selectedCupboardId: 1,
      }),
    );

    const renderedElements = getRenderedElements();
    const movingCupboard = renderedElements.find(
      (element) => element.type?.name === "CupboardMesh" && element.props.isMoving,
    );
    const idleCupboard = renderedElements.find(
      (element) => element.type?.name === "CupboardMesh" && !element.props.isMoving,
    );
    const preview = renderedElements.find((element) => element.type?.name === "GhostCupboardMesh");
    const overlayElements = renderedElements.filter((element) => element.type === CupboardWidthOverlay);
    const movingOverlay = overlayElements.find((element) => element.props.position?.x === 1);
    const idleOverlay = overlayElements.find((element) => element.props.position?.x === 2);
    const previewOverlay = overlayElements.find((element) => element.props.isGhost);

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
    expect(overlayElements).toHaveLength(3);
    expect(movingOverlay.props).toMatchObject({
      widthMm: 600,
      isInvalid: true,
      isActive: true,
    });
    expect(movingOverlay.props.isGhost).toBeUndefined();
    expect(idleOverlay.props).toMatchObject({
      widthMm: 600,
      isInvalid: false,
      isActive: true,
    });
    expect(previewOverlay.props).toMatchObject({
      widthMm: undefined,
      isInvalid: true,
      isGhost: true,
      isActive: true,
    });
  });

  it("keeps valid movement and preview styling out of the invalid state", () => {
    useCupboards.mockReturnValue(
      createBaseContext({
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
      }),
    );

    const renderedElements = getRenderedElements();
    const movingCupboard = renderedElements.find((element) => element.type?.name === "CupboardMesh");
    const preview = renderedElements.find((element) => element.type?.name === "GhostCupboardMesh");

    expect(movingCupboard.props.isInvalid).toBe(false);
    expect(preview.props.isInvalid).toBe(false);
  });

  it("renders width controls for the selected cupboard", () => {
    const selectedCupboard = createCupboardFixture(1);

    useCupboards.mockReturnValue(
      createBaseContext({
        cupboards: [selectedCupboard],
        selectedCupboard,
        selectedCupboardId: 1,
      }),
    );

    const renderedElements = getRenderedElements();
    const cupboard = renderedElements.find((element) => element.type?.name === "CupboardMesh");
    const controls = renderedElements.find((element) => element.type === SelectedCupboardWidthControls);
    const overlay = renderedElements.find((element) => element.type === CupboardWidthOverlay);

    expect(cupboard.props.isSelected).toBe(true);
    expect(controls.type).toBe(SelectedCupboardWidthControls);
    expect(controls.props.cupboard).toBe(selectedCupboard);
    expect(overlay.props).toMatchObject({
      widthMm: selectedCupboard.width,
      isInvalid: false,
      isActive: true,
    });
    expect(overlay.props.isGhost).toBeUndefined();
  });

  it("renders width overlays for idle non-selected cupboards after placement", () => {
    useCupboards.mockReturnValue(
      createBaseContext({
        cupboards: [createCupboardFixture(1), createCupboardFixture(2)],
      }),
    );

    const overlayElements = getRenderedElements().filter((element) => element.type === CupboardWidthOverlay);

    expect(overlayElements).toHaveLength(2);
    expect(overlayElements.map((element) => element.props.position.x)).toEqual([1, 2]);
    expect(overlayElements.every((element) => element.props.isActive)).toBe(true);
  });

  it("renders a ghost width overlay for the placement preview", () => {
    const preview = {
      ...createPlacementPreviewFixture(),
      width: 450,
      validation: {
        isValid: false,
      },
    };

    useCupboards.mockReturnValue(
      createBaseContext({
        placementPreview: preview,
      }),
    );

    const renderedElements = getRenderedElements();
    const [overlay] = renderedElements.filter((element) => element.type === CupboardWidthOverlay);

    expect(overlay.props).toMatchObject({
      widthMm: 450,
      isGhost: true,
      isInvalid: true,
      isActive: true,
    });
  });
});
