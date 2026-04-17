import React from "react";
import ReactDOMServer from "react-dom/server";

import PlannerSummaryPanel from "./PlannerSummaryPanel";
import { useCupboards } from "../../cupboards/state/CupboardProvider";

jest.mock("../../cupboards/state/CupboardProvider", () => ({
  useCupboards: jest.fn(),
}));

const defaultAppliedRoomDimensions = {
  length: 3600,
  width: 2800,
  height: 2400,
};

const renderPlannerSummaryPanel = (appliedRoomDimensions = defaultAppliedRoomDimensions) => {
  const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

  try {
    const markup = ReactDOMServer.renderToStaticMarkup(
      <PlannerSummaryPanel appliedRoomDimensions={appliedRoomDimensions} />,
    );
    const container = document.createElement("div");

    container.innerHTML = markup;
    return container;
  } finally {
    consoleErrorSpy.mockRestore();
  }
};

describe("PlannerSummaryPanel", () => {
  beforeEach(() => {
    useCupboards.mockReturnValue({
      pricingSummary: {
        lineItems: [],
        totalPrice: 0,
        objectCount: 0,
        isEmpty: true,
        currency: "USD",
        selectedLineItemId: null,
      },
      selectCupboard: jest.fn(),
    });
  });

  it("shows a zero-state with a zero total when there are no priced cabinets", () => {
    const container = renderPlannerSummaryPanel();

    expect(container.textContent).toContain("Live Pricing");
    expect(container.textContent).toContain("No cabinets priced yet");
    expect(container.textContent).toContain("The current cabinet total stays at $0.");
    expect(container.textContent).toContain("Total price");
    expect(container.textContent).toContain("$0");
    expect(container.textContent).toContain("0 cabinets");
    expect(container.textContent).toContain("3600 x 2800 x 2400 mm");
  });

  it("renders one pricing row per placed cabinet and highlights the selected line item", () => {
    useCupboards.mockReturnValue({
      pricingSummary: {
        lineItems: [
          {
            cupboardId: 1,
            instanceId: 1,
            catalogId: "base-double-door",
            displayName: "Double-door base cabinet",
            dimensionsLabel: "350 x 720 x 560 mm",
            price: 175,
            currency: "USD",
          },
          {
            cupboardId: 3,
            instanceId: 3,
            catalogId: "tall-pantry",
            displayName: "Pantry tower",
            dimensionsLabel: "600 x 2100 x 600 mm",
            price: 680,
            currency: "USD",
          },
        ],
        totalPrice: 855,
        objectCount: 2,
        isEmpty: false,
        currency: "USD",
        selectedLineItemId: 3,
      },
      selectCupboard: jest.fn(),
    });

    const container = renderPlannerSummaryPanel();
    const lineItems = [...container.querySelectorAll(".pricing-summary__item")];

    expect(lineItems).toHaveLength(2);
    expect(lineItems[0].textContent).toContain("Cabinet 1");
    expect(lineItems[0].textContent).toContain("Double-door base cabinet");
    expect(lineItems[0].textContent).toContain("350 x 720 x 560 mm");
    expect(lineItems[0].textContent).toContain("$175");
    expect(lineItems[0].getAttribute("aria-pressed")).toBe("false");
    expect(lineItems[1].textContent).toContain("Cabinet 3");
    expect(lineItems[1].textContent).toContain("Pantry tower");
    expect(lineItems[1].textContent).toContain("$680");
    expect(lineItems[1].className).toContain("pricing-summary__item--selected");
    expect(lineItems[1].getAttribute("aria-pressed")).toBe("true");
    expect(container.textContent).toContain("$855");
    expect(container.textContent).toContain("2 cabinets");
  });
});
