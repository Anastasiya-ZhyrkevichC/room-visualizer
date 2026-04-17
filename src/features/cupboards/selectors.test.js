import { selectPricingSummary } from "./selectors";

const createCupboardFixture = ({
  id,
  name = `Fixture cabinet ${id}`,
  width = 600,
  height = 720,
  depth = 560,
  price = 240,
  currency = "USD",
  catalogId = "base-double-door",
  position = { x: 0, y: -1.14, z: -1.72 },
  rotation = 0,
} = {}) => ({
  id,
  name,
  width,
  height,
  depth,
  price,
  currency,
  catalogId,
  position,
  rotation,
  wall: "back",
  size: [width / 1000, height / 1000, depth / 1000],
});

describe("pricing selectors", () => {
  it("derives stable line items and totals from the placed cupboards", () => {
    const summary = selectPricingSummary({
      cupboards: [
        createCupboardFixture({
          id: 4,
          name: "Pantry tower",
          width: 600,
          height: 2100,
          depth: 600,
          price: 680,
          catalogId: "tall-pantry",
        }),
        createCupboardFixture({
          id: 2,
          name: "Double-door base cabinet",
          width: 350,
          height: 720,
          depth: 560,
          price: 175,
        }),
      ],
      selectedCupboardId: 4,
    });

    expect(summary).toEqual({
      lineItems: [
        {
          cupboardId: 2,
          instanceId: 2,
          catalogId: "base-double-door",
          displayName: "Double-door base cabinet",
          dimensionsLabel: "350 x 720 x 560 mm",
          price: 175,
          currency: "USD",
        },
        {
          cupboardId: 4,
          instanceId: 4,
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
      hasMixedCurrencies: false,
      selectedLineItemId: 4,
    });
  });

  it("keeps pricing unchanged when cupboards are only moved, rotated, or re-selected", () => {
    const baseState = {
      cupboards: [
        createCupboardFixture({
          id: 1,
          name: "Double-door base cabinet",
          width: 300,
          price: 160,
          position: { x: -0.5, y: -1.14, z: -1.72 },
        }),
        createCupboardFixture({
          id: 2,
          name: "Three-drawer base cabinet",
          width: 900,
          price: 390,
          catalogId: "base-three-drawer",
        }),
      ],
      selectedCupboardId: 1,
    };
    const movedState = {
      cupboards: [
        createCupboardFixture({
          id: 1,
          name: "Double-door base cabinet",
          width: 300,
          price: 160,
          position: { x: 1.1, y: -1.14, z: -1.72 },
          rotation: Math.PI / 2,
        }),
        createCupboardFixture({
          id: 2,
          name: "Three-drawer base cabinet",
          width: 900,
          price: 390,
          catalogId: "base-three-drawer",
          position: { x: -1.72, y: -1.14, z: -0.3 },
          rotation: Math.PI / 2,
        }),
      ],
      selectedCupboardId: 2,
    };

    const baseSummary = selectPricingSummary(baseState);
    const movedSummary = selectPricingSummary(movedState);

    expect(movedSummary.lineItems).toEqual(baseSummary.lineItems);
    expect(movedSummary.totalPrice).toBe(baseSummary.totalPrice);
    expect(movedSummary.objectCount).toBe(baseSummary.objectCount);
    expect(movedSummary.selectedLineItemId).toBe(2);
  });

  it("updates the matching line item when a cupboard changes to a new priced variant", () => {
    const originalSummary = selectPricingSummary({
      cupboards: [
        createCupboardFixture({
          id: 3,
          name: "Double-door base cabinet",
          width: 300,
          price: 160,
        }),
      ],
      selectedCupboardId: 3,
    });
    const resizedSummary = selectPricingSummary({
      cupboards: [
        createCupboardFixture({
          id: 3,
          name: "Double-door base cabinet",
          width: 450,
          price: 205,
        }),
      ],
      selectedCupboardId: 3,
    });

    expect(originalSummary.totalPrice).toBe(160);
    expect(resizedSummary.lineItems[0]).toMatchObject({
      cupboardId: 3,
      dimensionsLabel: "450 x 720 x 560 mm",
      price: 205,
    });
    expect(resizedSummary.totalPrice).toBe(205);
  });
});
