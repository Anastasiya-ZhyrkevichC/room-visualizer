import React from "react";
import ReactDOMServer from "react-dom/server";

import { getDefaultProjectCustomisation } from "../../cupboards/model/customization";
import { starterCabinetCatalog } from "../../cupboards/model/catalog";
import { useCupboards } from "../../cupboards/state/CupboardProvider";
import CabinetCatalogPanel from "./CabinetCatalogPanel";

jest.mock("../../cupboards/state/CupboardProvider", () => ({
  useCupboards: jest.fn(),
}));

const renderCatalogPanel = () => {
  const markup = ReactDOMServer.renderToStaticMarkup(<CabinetCatalogPanel />);
  const container = document.createElement("div");

  container.innerHTML = markup;
  return container;
};

const getVariantTableData = (row) =>
  [...row.querySelectorAll(".catalog-row__variant-table tbody tr")].map((tableRow) =>
    [...tableRow.querySelectorAll("td")].map((cell) => cell.textContent.replace(/\s+/g, " ").trim()),
  );

describe("CabinetCatalogPanel", () => {
  beforeEach(() => {
    useCupboards.mockReturnValue({
      cancelPlacementPreview: jest.fn(),
      finishPlacementPreview: jest.fn(),
      placementPreview: null,
      projectCustomisation: getDefaultProjectCustomisation(),
      startPlacementPreview: jest.fn(),
    });
  });

  it("renders one visible row per cabinet definition with previews and live width-price tables", () => {
    const container = renderCatalogPanel();
    const rows = [...container.querySelectorAll(".catalog-row")];

    expect(rows).toHaveLength(starterCabinetCatalog.length);
    expect(container.querySelectorAll(".catalog-row__preview")).toHaveLength(starterCabinetCatalog.length);
    expect(container.querySelectorAll(".catalog-cabinet-preview__fallback")).toHaveLength(starterCabinetCatalog.length);
    expect(rows.map((row) => row.querySelector(".catalog-row__title")?.textContent)).toEqual(
      starterCabinetCatalog.map((cabinet) => cabinet.name),
    );

    const doubleDoorRow = rows.find((row) => row.textContent.includes("Double-door base cabinet"));

    expect(doubleDoorRow).toBeTruthy();
    expect(doubleDoorRow.querySelector(".catalog-row__select")).toBeNull();
    expect(doubleDoorRow.querySelector(".catalog-row__control-value")?.textContent).toBe("720 mm");
    expect(getVariantTableData(doubleDoorRow)).toEqual([
      ["300 mm", "$184"],
      ["350 mm", "$199"],
      ["400 mm", "$214"],
      ["450 mm", "$229"],
      ["600 mm", "$264"],
    ]);
    expect(doubleDoorRow.textContent).toContain("Depth 560 mm");
    expect(doubleDoorRow.textContent).toContain("With current defaults from $184");
  });

  it("renders a height selector when a cabinet has multiple height variants", () => {
    const container = renderCatalogPanel();
    const pantryRow = [...container.querySelectorAll(".catalog-row")].find((row) =>
      row.textContent.includes("Pantry tower"),
    );

    expect(pantryRow).toBeTruthy();
    expect([...pantryRow.querySelectorAll(".catalog-row__select option")].map((option) => option.textContent)).toEqual([
      "2100 mm",
      "2300 mm",
    ]);
    expect(getVariantTableData(pantryRow)).toEqual([["600 mm", "$704"]]);
    expect(pantryRow.textContent).toContain("With current defaults from $704");
  });

  it("renders wall cabinets from the starter catalog with current-default pricing", () => {
    const container = renderCatalogPanel();
    const wallRow = [...container.querySelectorAll(".catalog-row")].find((row) =>
      row.textContent.includes("Double-door wall cabinet"),
    );

    expect(wallRow).toBeTruthy();
    expect(wallRow.querySelector(".catalog-row__control-value")?.textContent).toBe("720 mm");
    expect(getVariantTableData(wallRow)).toEqual([
      ["300 mm", "$144"],
      ["350 mm", "$156"],
      ["400 mm", "$168"],
      ["450 mm", "$180"],
      ["600 mm", "$212"],
    ]);
    expect(wallRow.textContent).toContain("Depth 320 mm");
    expect(wallRow.textContent).toContain("With current defaults from $144");
  });

  it("removes action buttons and placement hint affordances", () => {
    const container = renderCatalogPanel();

    expect(container.querySelectorAll(".catalog-row button")).toHaveLength(0);
    expect(container.querySelectorAll(".catalog-row__variant-badge")).toHaveLength(0);
    expect(container.querySelector(".catalog-panel__hover-hint")).toBeNull();
  });
});
