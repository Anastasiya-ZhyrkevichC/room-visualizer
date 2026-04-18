import { createCupboard } from "../../cupboards/model/placement";
import { selectPricingSummary } from "../../cupboards/selectors";
import {
  createProjectDocument,
  createProjectPricingSnapshot,
  parseProjectDocument,
  reconcilePricingSnapshot,
} from "./projectPersistence";

const roomDimensions = {
  length: 3600,
  width: 2800,
  height: 2400,
};

const createLiveCupboard = ({ id, catalogId, activeVariantId, position }) =>
  createCupboard({
    id,
    cabinet: {
      catalogId,
      activeVariantId,
    },
    position,
    wall: "back",
  });

describe("projectPersistence", () => {
  it("stores the current visible pricing snapshot alongside exported planner state", () => {
    const cupboards = [
      createLiveCupboard({
        id: 1,
        catalogId: "base-double-door",
        activeVariantId: "350x720x560",
        position: { x: -0.4, y: -1.14, z: -1.72 },
      }),
      createLiveCupboard({
        id: 3,
        catalogId: "tall-pantry",
        activeVariantId: "600x2100x600",
        position: { x: 0.45, y: -0.45, z: -1.7 },
      }),
    ];
    const pricingSummary = selectPricingSummary({
      cupboards,
      selectedCupboardId: null,
    });
    const projectDocument = createProjectDocument({
      cupboards,
      pricingSummary,
      roomDimensions,
      savedAt: "2025-03-22T20:15:00Z",
      projectName: "Showroom Kitchen",
    });
    const parsedProject = parseProjectDocument(JSON.stringify(projectDocument));

    expect(projectDocument.pricingSnapshot).toEqual({
      savedAt: "2025-03-22T20:15:00.000Z",
      currency: "USD",
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
          isUnavailable: false,
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
          isUnavailable: false,
        },
      ],
      totalPrice: 855,
      objectCount: 2,
      unresolvedItemCount: 0,
      isResolved: true,
    });
    expect(parsedProject.roomDimensions).toEqual(roomDimensions);
    expect(parsedProject.pricingSnapshot.totalPrice).toBe(855);
    expect(parsedProject.cupboards[0]).toMatchObject({
      id: 1,
      catalogId: "base-double-door",
      activeVariantId: "350x720x560",
      price: 175,
    });
    expect(parsedProject.cupboards[1]).toMatchObject({
      id: 3,
      catalogId: "tall-pantry",
      activeVariantId: "600x2100x600",
      price: 680,
    });
  });

  it("rehydrates a missing catalog module as unavailable from its saved cabinet snapshot", () => {
    const cupboards = [
      createLiveCupboard({
        id: 8,
        catalogId: "tall-pantry",
        activeVariantId: "600x2100x600",
        position: { x: 0.1, y: -0.45, z: -1.7 },
      }),
    ];
    const pricingSummary = selectPricingSummary({
      cupboards,
      selectedCupboardId: null,
    });
    const projectDocument = createProjectDocument({
      cupboards,
      pricingSummary,
      roomDimensions,
      savedAt: "2025-03-22T20:15:00Z",
    });

    projectDocument.modules[0].catalogItemId = "legacy-pantry";
    projectDocument.modules[0].cabinetSnapshot.name = "Legacy pantry";
    projectDocument.modules[0].cabinetSnapshot.price = 640;

    const parsedProject = parseProjectDocument(JSON.stringify(projectDocument));

    expect(parsedProject.cupboards[0]).toMatchObject({
      id: 8,
      catalogId: "legacy-pantry",
      name: "Legacy pantry",
      price: 640,
      isUnavailable: true,
      unavailableReason: "missing-catalog-item",
    });
  });

  it("compares imported pricing snapshots against the current live planner total without silent repricing", () => {
    const pricingSnapshot = createProjectPricingSnapshot({
      currency: "USD",
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
      totalPrice: 855,
      objectCount: 2,
      unavailableCount: 0,
      isResolved: true,
    });
    const comparison = reconcilePricingSnapshot({
      pricingSnapshot,
      currentPricingSummary: {
        currency: "USD",
        totalPrice: 190,
        isResolved: false,
        lineItems: [
          {
            cupboardId: 1,
            instanceId: 1,
            catalogId: "base-double-door",
            displayName: "Double-door base cabinet",
            dimensionsLabel: "400 x 720 x 560 mm",
            price: 190,
            currency: "USD",
            isUnavailable: false,
          },
          {
            cupboardId: 3,
            instanceId: 3,
            catalogId: "tall-pantry",
            displayName: "Pantry tower",
            dimensionsLabel: "600 x 2100 x 600 mm",
            price: null,
            currency: "USD",
            isUnavailable: true,
          },
        ],
      },
    });

    expect(comparison).toMatchObject({
      changedCount: 1,
      unavailableCount: 1,
      removedCount: 0,
      liveOnlyCount: 0,
      hasDifferences: true,
      isLiveTotalComparable: false,
      liveTotalDelta: null,
    });
    expect(comparison.items[0]).toMatchObject({
      instanceId: 1,
      status: "changed",
      livePrice: 190,
      deltaPrice: 15,
    });
    expect(comparison.items[1]).toMatchObject({
      instanceId: 3,
      status: "unavailable",
      livePrice: null,
    });
  });
});
