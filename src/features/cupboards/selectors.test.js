import { getDefaultProjectCustomisation } from "./model/customization";
import { STRAIGHT_RUN_TABLE_TOP_PROFILE } from "./model/tableTop";
import { selectPricingSummary, selectTableTopRuns } from "./selectors";

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
  category = "base",
  model = {
    front: {
      type: "doubleDoor",
      doorCount: 2,
      handle: {
        lengthMm: 176,
      },
    },
    legs: {
      enabled: true,
      heightMm: 110,
    },
  },
  customisation = null,
  isUnavailable = false,
  position = { x: 0, y: -1.14, z: -1.72 },
  rotation = 0,
  tableTopProfile = null,
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
  category,
  model,
  customisation,
  isUnavailable,
  position,
  rotation,
  wall: "back",
  tableTopProfile,
  size: [width / 1000, height / 1000, depth / 1000],
});

describe("tabletop selectors", () => {
  it("derives merged tabletop runs from eligible placed cupboards only", () => {
    const runs = selectTableTopRuns({
      cupboards: [
        createCupboardFixture({
          id: 2,
          position: { x: -0.3, y: -1.14, z: -1.72 },
          tableTopProfile: STRAIGHT_RUN_TABLE_TOP_PROFILE,
        }),
        createCupboardFixture({
          id: 3,
          position: { x: 0.3, y: -1.14, z: -1.72 },
          tableTopProfile: STRAIGHT_RUN_TABLE_TOP_PROFILE,
        }),
        createCupboardFixture({
          id: 8,
          name: "Pantry tower",
          category: "tall",
          height: 2100,
          depth: 600,
          position: { x: 1.2, y: -0.45, z: -1.7 },
        }),
      ],
      placementPreview: createCupboardFixture({
        id: "preview",
        position: { x: 1.3, y: -1.14, z: -1.72 },
        tableTopProfile: STRAIGHT_RUN_TABLE_TOP_PROFILE,
      }),
    });

    expect(runs).toHaveLength(1);
    expect(runs[0]).toMatchObject({
      id: "table-top-back-2-3",
      wall: "back",
      cupboardIds: [2, 3],
    });
    expect(runs[0].length).toBeCloseTo(1.2);
    expect(runs[0].position.x).toBeCloseTo(0);
    expect(runs[0].position.y).toBeCloseTo(-0.76);
    expect(runs[0].position.z).toBeCloseTo(-1.71);
    expect(runs[0].size[0]).toBeCloseTo(1.2);
    expect(runs[0].size[1]).toBeCloseTo(0.04);
    expect(runs[0].size[2]).toBeCloseTo(0.58);
  });

  it("returns no tabletop runs when only the placement preview is eligible", () => {
    expect(
      selectTableTopRuns({
        cupboards: [],
        placementPreview: createCupboardFixture({
          id: "preview",
          tableTopProfile: STRAIGHT_RUN_TABLE_TOP_PROFILE,
        }),
      }),
    ).toEqual([]);
  });
});

describe("pricing selectors", () => {
  it("derives live line items and totals from project defaults plus cabinet overrides", () => {
    const summary = selectPricingSummary({
      cupboards: [
        createCupboardFixture({
          id: 4,
          name: "Pantry tower",
          width: 600,
          height: 2100,
          depth: 600,
          price: 680,
          category: "tall",
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
      projectCustomisation: getDefaultProjectCustomisation(),
      selectedCupboardId: 4,
    });

    expect(summary.totalPrice).toBe(903);
    expect(summary.objectCount).toBe(2);
    expect(summary.isResolved).toBe(true);
    expect(summary.selectedLineItemId).toBe(4);
    expect(summary.lineItems[0]).toMatchObject({
      cupboardId: 2,
      displayName: "Double-door base cabinet",
      dimensionsLabel: "350 x 720 x 560 mm",
      bodyPrice: 175,
      facadePrice: 0,
      handlePrice: 24,
      accessoriesPrice: 0,
      totalPrice: 199,
      price: 199,
      customisationChips: expect.arrayContaining([
        "Facade: White matte",
        "Handle: Brushed steel",
        "Preset: Standard",
      ]),
      isCustomised: false,
    });
    expect(summary.lineItems[1]).toMatchObject({
      cupboardId: 4,
      catalogId: "tall-pantry",
      bodyPrice: 680,
      handlePrice: 24,
      accessoriesPrice: 0,
      totalPrice: 704,
    });
  });

  it("recalculates inherited and customized cabinets without being affected by movement or reselection", () => {
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
          category: "drawer",
          catalogId: "base-three-drawer",
          model: {
            front: {
              type: "drawers",
              drawerCount: 3,
              handle: {
                orientation: "horizontal",
                lengthMm: 224,
              },
            },
            legs: {
              enabled: true,
              heightMm: 110,
            },
          },
        }),
      ],
      projectCustomisation: getDefaultProjectCustomisation(),
      selectedCupboardId: 1,
    };
    const movedState = {
      ...baseState,
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
          category: "drawer",
          catalogId: "base-three-drawer",
          position: { x: -1.72, y: -1.14, z: -0.3 },
          rotation: Math.PI / 2,
          model: {
            front: {
              type: "drawers",
              drawerCount: 3,
              handle: {
                orientation: "horizontal",
                lengthMm: 224,
              },
            },
            legs: {
              enabled: true,
              heightMm: 110,
            },
          },
        }),
      ],
      selectedCupboardId: 2,
    };

    const baseSummary = selectPricingSummary(baseState);
    const movedSummary = selectPricingSummary(movedState);

    expect(baseSummary.totalPrice).toBe(635);
    expect(movedSummary.totalPrice).toBe(baseSummary.totalPrice);
    expect(movedSummary.lineItems[0]).toMatchObject(baseSummary.lineItems[0]);
    expect(movedSummary.lineItems[1]).toMatchObject(baseSummary.lineItems[1]);
    expect(movedSummary.selectedLineItemId).toBe(2);
  });

  it("updates the matching line item when a cupboard changes width or custom facade overrides", () => {
    const inheritedSummary = selectPricingSummary({
      cupboards: [
        createCupboardFixture({
          id: 3,
          name: "Double-door base cabinet",
          width: 300,
          price: 160,
        }),
      ],
      projectCustomisation: getDefaultProjectCustomisation(),
      selectedCupboardId: 3,
    });
    const customizedSummary = selectPricingSummary({
      cupboards: [
        createCupboardFixture({
          id: 3,
          name: "Double-door base cabinet",
          width: 450,
          price: 205,
          customisation: {
            facadeId: "facade-oak-matte",
            handleId: null,
            carcassId: null,
            accessoryPresetId: null,
            accessoryIds: null,
          },
        }),
      ],
      projectCustomisation: getDefaultProjectCustomisation(),
      selectedCupboardId: 3,
    });

    expect(inheritedSummary.totalPrice).toBe(184);
    expect(customizedSummary.lineItems[0]).toMatchObject({
      cupboardId: 3,
      dimensionsLabel: "450 x 720 x 560 mm",
      facadePrice: 40,
      handlePrice: 24,
      totalPrice: 269,
      isCustomised: true,
      customisationChips: expect.arrayContaining(["Facade: Oak matte", "Customized"]),
    });
    expect(customizedSummary.totalPrice).toBe(269);
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
          category: "tall",
          catalogId: "legacy-pantry",
          activeVariantId: "600x2100x600",
          isUnavailable: true,
        }),
      ],
      projectCustomisation: getDefaultProjectCustomisation(),
      selectedCupboardId: 7,
    });

    expect(summary.totalPrice).toBe(199);
    expect(summary.unavailableCount).toBe(1);
    expect(summary.hasUnavailableItems).toBe(true);
    expect(summary.isResolved).toBe(false);
    expect(summary.resolvedObjectCount).toBe(1);
    expect(summary.lineItems[1]).toMatchObject({
      cupboardId: 7,
      instanceId: 7,
      catalogId: "legacy-pantry",
      activeVariantId: "600x2100x600",
      displayName: "Legacy pantry",
      dimensionsLabel: "600 x 2100 x 600 mm",
      price: null,
      totalPrice: null,
      referencePrice: 640,
      currency: "USD",
      isUnavailable: true,
      unavailableReason: null,
    });
  });
});
