import React from "react";
import ReactDOMServer from "react-dom/server";

import CabinetCatalogPanel from "./CabinetCatalogPanel";
import { starterCabinetCatalog } from "../../cupboards/model/catalog";
import { useCupboards } from "../../cupboards/state/CupboardProvider";

jest.mock("../../cupboards/state/CupboardProvider", () => ({
  useCupboards: jest.fn(),
}));

const renderCatalogPanel = () => {
  const markup = ReactDOMServer.renderToStaticMarkup(<CabinetCatalogPanel />);
  const container = document.createElement("div");

  container.innerHTML = markup;
  return container;
};

const getSizeSummaryMap = (row) =>
  [...row.querySelectorAll(".catalog-row__size-line")].reduce((summary, line) => {
    const label = line.querySelector(".catalog-row__size-label")?.textContent;
    const value = line.querySelector(".catalog-row__size-value")?.textContent;

    if (label) {
      summary[label] = value;
    }

    return summary;
  }, {});

describe("CabinetCatalogPanel", () => {
  beforeEach(() => {
    useCupboards.mockReturnValue({
      cancelPlacementPreview: jest.fn(),
      finishPlacementPreview: jest.fn(),
      placementPreview: null,
      startPlacementPreview: jest.fn(),
    });
  });

  it("renders one visible row per cabinet definition with structured size summaries", () => {
    const container = renderCatalogPanel();
    const rows = [...container.querySelectorAll(".catalog-row")];

    expect(rows).toHaveLength(starterCabinetCatalog.length);
    expect(rows.map((row) => row.querySelector(".catalog-row__title")?.textContent)).toEqual(
      starterCabinetCatalog.map((cabinet) => cabinet.name),
    );

    const doubleDoorRow = rows.find((row) => row.textContent.includes("Double-door base cabinet"));

    expect(doubleDoorRow).toBeTruthy();
    const doubleDoorSummary = getSizeSummaryMap(doubleDoorRow);
    expect(doubleDoorRow.querySelectorAll(".catalog-row__size-line")).toHaveLength(2);
    expect(doubleDoorSummary).toEqual({
      Widths: "300 / 350 / 400 / 450 / 600 mm",
      Heights: "720 mm",
    });
    expect(doubleDoorRow.textContent).toContain("Depth 560 mm");
    expect(doubleDoorRow.textContent).toContain("Places smallest first, resize after selection");
    expect(doubleDoorRow.textContent).toContain("From $160");
  });

  it("keeps taller cabinet options readable without duplicating separate product rows", () => {
    const container = renderCatalogPanel();
    const pantryRow = [...container.querySelectorAll(".catalog-row")].find((row) =>
      row.textContent.includes("Pantry tower"),
    );

    expect(pantryRow).toBeTruthy();
    const pantrySummary = getSizeSummaryMap(pantryRow);
    expect(pantrySummary).toEqual({
      Widths: "600 mm",
      Heights: "2100 / 2300 mm",
    });
    expect(pantryRow.textContent).toContain("From $680");
  });
});
