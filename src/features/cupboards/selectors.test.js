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
  activeVariantId = "600x720x560",
  isUnavailable = false,
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
  activeVariantId,
  isUnavailable,
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
          activeVariantId: "600x720x560",
          displayName: "Double-door base cabinet",
          dimensionsLabel: "350 x 720 x 560 mm",
          price: 175,
          referencePrice: null,
          currency: "USD",
          isUnavailable: false,
          unavailableReason: null,
        },
        {
          cupboardId: 4,
          instanceId: 4,
          catalogId: "tall-pantry",
          activeVariantId: "600x720x560",
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
      hasMixedCurrencies: false,
      resolvedObjectCount: 2,
      unavailableCount: 0,
      hasUnavailableItems: false,
      isResolved: true,
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

  it("marks unavailable imported cabinets as unresolved and excludes them from the live total", () => {
    const summary = selectPricingSummary({
      cupboards: [
        createCupboardFixture({
          id: 2,
          name: "Double-door base cabinet",
          width: 350,
          price: 175,
        }),
        createCupboardFixture({
          id: 7,
          name: "Legacy pantry",
          width: 600,
          height: 2100,
          depth: 600,
          price: 640,
          catalogId: "legacy-pantry",
          activeVariantId: "600x2100x600",
          isUnavailable: true,
        }),
      ],
      selectedCupboardId: 7,
    });

    expect(summary.totalPrice).toBe(175);
    expect(summary.unavailableCount).toBe(1);
    expect(summary.hasUnavailableItems).toBe(true);
    expect(summary.isResolved).toBe(false);
    expect(summary.resolvedObjectCount).toBe(1);
    expect(summary.lineItems[1]).toEqual({
      cupboardId: 7,
      instanceId: 7,
      catalogId: "legacy-pantry",
      activeVariantId: "600x2100x600",
      displayName: "Legacy pantry",
      dimensionsLabel: "600 x 2100 x 600 mm",
      price: null,
      referencePrice: 640,
      currency: "USD",
      isUnavailable: true,
      unavailableReason: null,
    });
  });
});
