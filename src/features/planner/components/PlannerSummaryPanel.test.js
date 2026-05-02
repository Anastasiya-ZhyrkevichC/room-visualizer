import React from "react";
import ReactDOMServer from "react-dom/server";

import { useCupboards } from "../../cupboards/state/CupboardProvider";
import PlannerSummaryPanel from "./PlannerSummaryPanel";

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
      tableTopRuns: [],
      selectCupboard: jest.fn(),
    });
  });

  it("shows a zero-state live estimate when there are no priced cabinets", () => {
    const container = renderPlannerSummaryPanel();

    expect(container.textContent).toContain("Live Estimate");
    expect(container.textContent).toContain("No cabinets priced yet");
    expect(container.textContent).toContain("The current cabinet total stays at $0.");
    expect(container.textContent).toContain("Body + carcass + facade + handle + accessories.");
    expect(container.textContent).toContain("Total price");
    expect(container.textContent).toContain("$0");
    expect(container.textContent).toContain("0 cabinets");
    expect(container.textContent).toContain("3600 x 2800 x 2400 mm");
    expect(container.textContent).toContain("Table tops");
    expect(container.textContent).toContain("0 pieces");
    expect(container.textContent).toContain("No table tops yet");
    expect(container.textContent).toContain("Export JSON");
    expect(container.textContent).toContain("Import JSON");
  });

  it("renders one tabletop summary row per derived run", () => {
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
      tableTopRuns: [
        {
          id: "table-top-back-1-2",
          wall: "back",
          length: 1.8,
          depth: 0.62,
          thickness: 0.04,
          cupboardIds: [1, 2],
        },
        {
          id: "table-top-left-3",
          wall: "left",
          length: 0.6,
          depth: 0.62,
          thickness: 0.04,
          cupboardIds: [3],
        },
      ],
      selectCupboard: jest.fn(),
    });

    const container = renderPlannerSummaryPanel();
    const tableTopItems = [...container.querySelectorAll(".table-top-summary__item")];

    expect(tableTopItems).toHaveLength(2);
    expect(container.textContent).toContain("2 pieces");
    expect(tableTopItems[0].textContent).toContain("Back wall");
    expect(tableTopItems[0].textContent).toContain("Supports 2 cabinets");
    expect(tableTopItems[0].textContent).toContain("1800 x 620 x 40 mm");
    expect(tableTopItems[1].textContent).toContain("Left wall");
    expect(tableTopItems[1].textContent).toContain("Supports 1 cabinet");
    expect(tableTopItems[1].textContent).toContain("600 x 620 x 40 mm");
  });

  it("renders pricing rows with line-item chips and highlights the selected cabinet", () => {
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
            totalPrice: 239,
            price: 239,
            bodyPrice: 175,
            carcassPrice: 0,
            facadePrice: 40,
            handlePrice: 24,
            accessoriesPrice: 0,
            referencePrice: null,
            currency: "USD",
            isUnavailable: false,
            unavailableReason: null,
            customisationChips: ["Facade: Oak matte", "Preset: Standard", "Customized"],
          },
          {
            cupboardId: 3,
            instanceId: 3,
            catalogId: "tall-pantry",
            activeVariantId: "600x2100x600",
            displayName: "Pantry tower",
            dimensionsLabel: "600 x 2100 x 600 mm",
            totalPrice: 704,
            price: 704,
            bodyPrice: 680,
            carcassPrice: 0,
            facadePrice: 0,
            handlePrice: 24,
            accessoriesPrice: 0,
            referencePrice: null,
            currency: "USD",
            isUnavailable: false,
            unavailableReason: null,
            customisationChips: ["Facade: White matte", "Preset: Standard"],
          },
        ],
        totalPrice: 943,
        objectCount: 2,
        isEmpty: false,
        currency: "USD",
        unavailableCount: 0,
        hasUnavailableItems: false,
        isResolved: true,
        selectedLineItemId: 3,
      },
      tableTopRuns: [],
      selectCupboard: jest.fn(),
    });

    const container = renderPlannerSummaryPanel();
    const lineItems = [...container.querySelectorAll(".pricing-summary__item")];

    expect(lineItems).toHaveLength(2);
    expect(lineItems[0].textContent).toContain("Cabinet 1");
    expect(lineItems[0].textContent).toContain("Double-door base cabinet");
    expect(lineItems[0].textContent).toContain("350 x 720 x 560 mm");
    expect(lineItems[0].textContent).toContain("$239");
    expect(lineItems[0].textContent).toContain("Facade: Oak matte");
    expect(lineItems[0].textContent).toContain("Customized");
    expect(lineItems[0].getAttribute("aria-pressed")).toBe("false");
    expect(lineItems[1].textContent).toContain("Cabinet 3");
    expect(lineItems[1].textContent).toContain("Pantry tower");
    expect(lineItems[1].textContent).toContain("$704");
    expect(lineItems[1].className).toContain("pricing-summary__item--selected");
    expect(lineItems[1].getAttribute("aria-pressed")).toBe("true");
    expect(container.textContent).toContain("$943");
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
            totalPrice: 214,
            price: 214,
            referencePrice: null,
            currency: "USD",
            isUnavailable: false,
            unavailableReason: null,
            customisationChips: ["Facade: White matte"],
          },
          {
            cupboardId: 3,
            instanceId: 3,
            catalogId: "tall-pantry",
            activeVariantId: "600x2100x600",
            displayName: "Pantry tower",
            dimensionsLabel: "600 x 2100 x 600 mm",
            totalPrice: null,
            price: null,
            referencePrice: 704,
            currency: "USD",
            isUnavailable: true,
            unavailableReason: "missing-catalog-item",
            customisationChips: [],
          },
        ],
        totalPrice: 214,
        objectCount: 2,
        isEmpty: false,
        currency: "USD",
        unavailableCount: 1,
        hasUnavailableItems: true,
        isResolved: false,
        selectedLineItemId: 3,
      },
      tableTopRuns: [],
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
          totalPrice: 903,
          lineItems: [
            {
              cupboardId: 1,
              instanceId: 1,
              catalogId: "base-double-door",
              activeVariantId: "350x720x560",
              displayName: "Double-door base cabinet",
              dimensionsLabel: "350 x 720 x 560 mm",
              price: 199,
              totalPrice: 199,
              currency: "USD",
            },
            {
              cupboardId: 3,
              instanceId: 3,
              catalogId: "tall-pantry",
              activeVariantId: "600x2100x600",
              displayName: "Pantry tower",
              dimensionsLabel: "600 x 2100 x 600 mm",
              price: 704,
              totalPrice: 704,
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
              price: 199,
              totalPrice: 199,
              currency: "USD",
              status: "changed",
              livePrice: 214,
              liveCurrency: "USD",
              deltaPrice: 15,
            },
            {
              instanceId: 3,
              displayName: "Pantry tower",
              dimensionsLabel: "600 x 2100 x 600 mm",
              price: 704,
              totalPrice: 704,
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
    expect(container.textContent).toContain("1 unavailable cabinet excluded from the live total.");
    expect(container.textContent).toContain("Unavailable");
    expect(container.textContent).toContain("Saved pricing reference");
    expect(container.textContent).toContain("Live repricing is unresolved");
    expect(container.textContent).toContain("Live now $214 (+$15).");
    expect(container.textContent).toContain("Saved snapshot total");
    expect(container.textContent).toContain("$903");
    expect(container.textContent).toContain("older-kitchen.room-project.json");
  });
});
