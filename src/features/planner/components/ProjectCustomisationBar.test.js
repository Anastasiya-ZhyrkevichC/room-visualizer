import React from "react";
import ReactDOMServer from "react-dom/server";

import { getDefaultProjectCustomisation } from "../../cupboards/model/customization";
import { useCupboards } from "../../cupboards/state/CupboardProvider";
import ProjectCustomisationBar from "./ProjectCustomisationBar";

jest.mock("../../cupboards/state/CupboardProvider", () => ({
  useCupboards: jest.fn(),
}));

const renderProjectCustomisationBar = () => {
  const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

  try {
    const markup = ReactDOMServer.renderToStaticMarkup(<ProjectCustomisationBar />);
    const container = document.createElement("div");

    container.innerHTML = markup;
    return container;
  } finally {
    consoleErrorSpy.mockRestore();
  }
};

describe("ProjectCustomisationBar", () => {
  it("shows project default selectors, the live estimate, and inherited-cabinet messaging", () => {
    useCupboards.mockReturnValue({
      inheritedCupboardCount: 2,
      pricingSummary: {
        totalPrice: 903,
        currency: "USD",
        objectCount: 3,
      },
      projectCustomisation: getDefaultProjectCustomisation(),
      updateProjectCustomisation: jest.fn(),
    });

    const container = renderProjectCustomisationBar();

    expect(container.textContent).toContain("Project Defaults");
    expect(container.textContent).toContain("Set finishes once, then place and customise exceptions.");
    expect(container.textContent).toContain("Inside body / carcass");
    expect(container.textContent).toContain("Facade");
    expect(container.textContent).toContain("Handle");
    expect(container.textContent).toContain("Accessory preset");
    expect(container.textContent).toContain("Applies live to 2 inheriting cabinets.");
    expect(container.textContent).toContain("Live estimate");
    expect(container.textContent).toContain("$903");
  });
});
