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

const renderPlannerSummaryPanel = ({
  appliedRoomDimensions = defaultAppliedRoomDimensions,
  onExportProject = jest.fn(),
  onImportProject = jest.fn(),
  pricingReference = null,
  projectTransferFeedback = null,
} = {}) => {
  const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

  try {
    const markup = ReactDOMServer.renderToStaticMarkup(
      <PlannerSummaryPanel
        appliedRoomDimensions={appliedRoomDimensions}
        onExportProject={onExportProject}
        onImportProject={onImportProject}
        pricingReference={pricingReference}
        projectTransferFeedback={projectTransferFeedback}
      />,
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
        unavailableCount: 0,
        hasUnavailableItems: false,
        isResolved: true,
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
    expect(container.textContent).toContain("Export JSON");
    expect(container.textContent).toContain("Import JSON");
  });

  it("renders one pricing row per placed cabinet and highlights the selected line item", () => {
    useCupboards.mockReturnValue({
      pricingSummary: {
        lineItems: [
          {
            cupboardId: 1,
            instanceId: 1,
            catalogId: "base-double-door",
            activeVariantId: "350x720x560",
            displayName: "Double-door base cabinet",
            dimensionsLabel: "350 x 720 x 560 mm",
            price: 175,
            referencePrice: null,
            currency: "USD",
            isUnavailable: false,
            unavailableReason: null,
          },
          {
            cupboardId: 3,
            instanceId: 3,
            catalogId: "tall-pantry",
            activeVariantId: "600x2100x600",
            displayName: "Pantry tower",
            dimensionsLabel: "600 x 2100 x 600 mm",
            price: 680,
            referencePrice: null,
            currency: "USD",
            isUnavailable: false,
            unavailableReason: null,
          },
        ],
        totalPrice: 855,
        objectCount: 2,
        isEmpty: false,
        currency: "USD",
        unavailableCount: 0,
        hasUnavailableItems: false,
        isResolved: true,
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

  it("shows partial live totals and saved snapshot reconciliation for imported pricing", () => {
    useCupboards.mockReturnValue({
      pricingSummary: {
        lineItems: [
          {
            cupboardId: 1,
            instanceId: 1,
            catalogId: "base-double-door",
            activeVariantId: "400x720x560",
            displayName: "Double-door base cabinet",
            dimensionsLabel: "400 x 720 x 560 mm",
            price: 190,
            referencePrice: null,
            currency: "USD",
            isUnavailable: false,
            unavailableReason: null,
          },
          {
            cupboardId: 3,
            instanceId: 3,
            catalogId: "tall-pantry",
            activeVariantId: "600x2100x600",
            displayName: "Pantry tower",
            dimensionsLabel: "600 x 2100 x 600 mm",
            price: null,
            referencePrice: 680,
            currency: "USD",
            isUnavailable: true,
            unavailableReason: "missing-catalog-item",
          },
        ],
        totalPrice: 190,
        objectCount: 2,
        isEmpty: false,
        currency: "USD",
        unavailableCount: 1,
        hasUnavailableItems: true,
        isResolved: false,
        selectedLineItemId: 3,
      },
      selectCupboard: jest.fn(),
    });

    const container = renderPlannerSummaryPanel({
      pricingReference: {
        source: "import",
        savedAt: "2025-03-22T20:15:00.000Z",
        fileName: "older-kitchen.room-project.json",
        snapshot: {
          savedAt: "2025-03-22T20:15:00.000Z",
          currency: "USD",
          totalPrice: 855,
          lineItems: [
            {
              cupboardId: 1,
              instanceId: 1,
              catalogId: "base-double-door",
              activeVariantId: "350x720x560",
              displayName: "Double-door base cabinet",
              dimensionsLabel: "350 x 720 x 560 mm",
              price: 175,
              currency: "USD",
            },
            {
              cupboardId: 3,
              instanceId: 3,
              catalogId: "tall-pantry",
              activeVariantId: "600x2100x600",
              displayName: "Pantry tower",
              dimensionsLabel: "600 x 2100 x 600 mm",
              price: 680,
              currency: "USD",
            },
          ],
        },
        comparison: {
          items: [
            {
              instanceId: 1,
              displayName: "Double-door base cabinet",
              dimensionsLabel: "350 x 720 x 560 mm",
              price: 175,
              currency: "USD",
              status: "changed",
              livePrice: 190,
              liveCurrency: "USD",
              deltaPrice: 15,
            },
            {
              instanceId: 3,
              displayName: "Pantry tower",
              dimensionsLabel: "600 x 2100 x 600 mm",
              price: 680,
              currency: "USD",
              status: "unavailable",
              livePrice: null,
              liveCurrency: "USD",
              deltaPrice: null,
            },
          ],
          liveOnlyCount: 0,
          hasDifferences: true,
          changedCount: 1,
          unavailableCount: 1,
          removedCount: 0,
          isLiveTotalComparable: false,
          liveTotalDelta: null,
        },
      },
      projectTransferFeedback: {
        tone: "info",
        message:
          "Imported older-kitchen.room-project.json. Review the pricing comparison below before treating the live total as final.",
      },
    });

    expect(container.textContent).toContain("Partial live total");
    expect(container.textContent).toContain("1 unavailable cabinet excluded until replaced or removed.");
    expect(container.textContent).toContain("Unavailable");
    expect(container.textContent).toContain("Saved pricing reference");
    expect(container.textContent).toContain("Live repricing is unresolved");
    expect(container.textContent).toContain("Live now $190 (+$15).");
    expect(container.textContent).toContain("Saved snapshot total");
    expect(container.textContent).toContain("$855");
    expect(container.textContent).toContain("older-kitchen.room-project.json");
  });
});
