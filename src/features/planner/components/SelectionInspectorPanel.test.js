import React from "react";
import ReactDOMServer from "react-dom/server";

import SelectionInspectorPanel from "./SelectionInspectorPanel";
import { resolveStarterCabinetInstance } from "../../cupboards/model/catalog";
import { useCupboards } from "../../cupboards/state/CupboardProvider";

jest.mock("../../cupboards/state/CupboardProvider", () => ({
  useCupboards: jest.fn(),
}));

const renderSelectionInspectorPanel = () => {
  const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

  try {
    const markup = ReactDOMServer.renderToStaticMarkup(<SelectionInspectorPanel />);
    const container = document.createElement("div");

    container.innerHTML = markup;
    return container;
  } finally {
    consoleErrorSpy.mockRestore();
  }
};

const getDetailMap = (container) =>
  [...container.querySelectorAll(".selection-details__item")].reduce((details, item) => {
    const label = item.querySelector(".selection-details__label")?.textContent;
    const value = item.querySelector(".selection-details__value")?.textContent;

    if (label) {
      details[label] = value;
    }

    return details;
  }, {});

describe("SelectionInspectorPanel", () => {
  beforeEach(() => {
    useCupboards.mockReturnValue({
      selectedCupboard: null,
      clearSelection: jest.fn(),
      rotateSelectedCupboard: jest.fn(),
      deleteSelectedCupboard: jest.fn(),
    });
  });

  it("shows the active size plus supported width and height references for the selected cabinet", () => {
    useCupboards.mockReturnValue({
      selectedCupboard: {
        id: 7,
        ...resolveStarterCabinetInstance({
          catalogId: "base-double-door",
          activeVariantId: "350x720x560",
        }),
        position: {
          x: 0.25,
          y: -1.14,
          z: -1.72,
        },
        rotation: 0,
        wall: "back",
      },
      clearSelection: jest.fn(),
      rotateSelectedCupboard: jest.fn(),
      deleteSelectedCupboard: jest.fn(),
    });

    const container = renderSelectionInspectorPanel();
    const details = getDetailMap(container);

    expect(container.textContent).toContain("Double-door base cabinet");
    expect(container.textContent).toContain("Use the in-scene width arrows to step through supported widths.");
    expect(container.textContent).toContain("Height options are display-only for now.");
    expect(details).toMatchObject({
      "Cabinet family": "Base cabinets with doors",
      "Active cabinet size": "350 x 720 x 560 mm",
      "Supported widths": "300 / 350 / 400 / 450 / 600 mm",
      "Supported heights": "720 mm",
      "Height editing": "Height options are display-only for now",
      "Prototype price": "$175",
    });
  });

  it("keeps the empty state when nothing is selected", () => {
    const container = renderSelectionInspectorPanel();

    expect(container.textContent).toContain("Nothing selected yet");
    expect(container.querySelectorAll(".selection-details__item")).toHaveLength(0);
  });
});
