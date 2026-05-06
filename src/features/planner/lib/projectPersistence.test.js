import { getDefaultProjectCustomisation } from "../../cupboards/model/customization";
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

const createLiveCupboard = ({ id, catalogId, activeVariantId, position, customisation = undefined }) =>
  createCupboard({
    id,
    cabinet: {
      catalogId,
      activeVariantId,
      customisation,
    },
    position,
    wall: "back",
  });

describe("projectPersistence", () => {
  it("stores project defaults, cabinet overrides, and pricing breakdowns alongside exported planner state", () => {
    const projectCustomisation = getDefaultProjectCustomisation();
    const cupboards = [
      createLiveCupboard({
        id: 1,
        catalogId: "base-double-door",
        activeVariantId: "350x720x560",
        position: { x: -0.4, y: -1.14, z: -1.72 },
        customisation: {
          facadeId: "facade-oak-matte",
          handleId: null,
          carcassId: null,
          accessoryPresetId: null,
          accessoryIds: null,
        },
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
      projectCustomisation,
      selectedCupboardId: null,
    });
    const projectDocument = createProjectDocument({
      cupboards,
      pricingSummary,
      projectCustomisation,
      roomDimensions,
      savedAt: "2025-03-22T20:15:00Z",
      projectName: "Showroom Kitchen",
    });
    const parsedProject = parseProjectDocument(JSON.stringify(projectDocument));

    expect(projectDocument.projectCustomisation).toEqual(projectCustomisation);
    expect(projectDocument.modules[0].customisation).toEqual({
      carcassId: null,
      facadeId: "facade-oak-matte",
      handleId: null,
      accessoryPresetId: null,
      accessoryIds: null,
    });
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
          price: 239,
          totalPrice: 239,
          bodyPrice: 175,
          carcassPrice: 0,
          facadePrice: 40,
          handlePrice: 24,
          accessoriesPrice: 0,
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
          price: 704,
          totalPrice: 704,
          bodyPrice: 680,
          carcassPrice: 0,
          facadePrice: 0,
          handlePrice: 24,
          accessoriesPrice: 0,
          currency: "USD",
          isUnavailable: false,
        },
      ],
      totalPrice: 943,
      objectCount: 2,
      unresolvedItemCount: 0,
      isResolved: true,
    });
    expect(parsedProject.roomDimensions).toEqual(roomDimensions);
    expect(parsedProject.projectCustomisation).toEqual(projectCustomisation);
    expect(parsedProject.pricingSnapshot.totalPrice).toBe(943);
    expect(parsedProject.cupboards[0]).toMatchObject({
      id: 1,
      catalogId: "base-double-door",
      activeVariantId: "350x720x560",
      customisation: {
        facadeId: "facade-oak-matte",
      },
    });
    expect(parsedProject.cupboards[1]).toMatchObject({
      id: 3,
      catalogId: "tall-pantry",
      activeVariantId: "600x2100x600",
    });
  });

  it("rehydrates a missing catalog module as unavailable from its saved cabinet snapshot", () => {
    const cupboards = [
      createLiveCupboard({
        id: 8,
        catalogId: "tall-pantry",
        activeVariantId: "600x2100x600",
        position: { x: 0.1, y: -0.45, z: -1.7 },
        customisation: {
          facadeId: "facade-sage-matte",
          handleId: null,
          carcassId: null,
          accessoryPresetId: null,
          accessoryIds: null,
        },
      }),
    ];
    const pricingSummary = selectPricingSummary({
      cupboards,
      projectCustomisation: getDefaultProjectCustomisation(),
      selectedCupboardId: null,
    });
    const projectDocument = createProjectDocument({
      cupboards,
      pricingSummary,
      projectCustomisation: getDefaultProjectCustomisation(),
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
      customisation: {
        facadeId: "facade-sage-matte",
      },
    });
  });

  it("migrates schema v1 projects onto current default customisation settings", () => {
    const cupboards = [
      createLiveCupboard({
        id: 5,
        catalogId: "base-double-door",
        activeVariantId: "300x720x560",
        position: { x: 0, y: -1.14, z: -1.72 },
      }),
    ];
    const pricingSummary = selectPricingSummary({
      cupboards,
      projectCustomisation: getDefaultProjectCustomisation(),
      selectedCupboardId: null,
    });
    const schemaTwoProject = createProjectDocument({
      cupboards,
      pricingSummary,
      projectCustomisation: getDefaultProjectCustomisation(),
      roomDimensions,
    });
    const legacyProject = {
      ...schemaTwoProject,
      schemaVersion: 1,
    };

    delete legacyProject.projectCustomisation;
    delete legacyProject.modules[0].customisation;

    const parsedProject = parseProjectDocument(JSON.stringify(legacyProject));

    expect(parsedProject.schemaVersion).toBe(1);
    expect(parsedProject.projectCustomisation).toEqual(getDefaultProjectCustomisation());
    expect(parsedProject.cupboards[0].customisation).toEqual({
      carcassId: null,
      facadeId: null,
      handleId: null,
      accessoryPresetId: null,
      accessoryIds: null,
    });
    expect(parsedProject.migration?.message).toContain("schema version 1 files did not store");
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
          price: 199,
          totalPrice: 199,
          bodyPrice: 175,
          carcassPrice: 0,
          facadePrice: 0,
          handlePrice: 24,
          accessoriesPrice: 0,
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
          bodyPrice: 680,
          carcassPrice: 0,
          facadePrice: 0,
          handlePrice: 24,
          accessoriesPrice: 0,
          currency: "USD",
        },
      ],
      totalPrice: 903,
      objectCount: 2,
      unavailableCount: 0,
      isResolved: true,
    });
    const comparison = reconcilePricingSnapshot({
      pricingSnapshot,
      currentPricingSummary: {
        currency: "USD",
        totalPrice: 214,
        isResolved: false,
        lineItems: [
          {
            cupboardId: 1,
            instanceId: 1,
            catalogId: "base-double-door",
            displayName: "Double-door base cabinet",
            dimensionsLabel: "400 x 720 x 560 mm",
            price: 214,
            totalPrice: 214,
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
            totalPrice: null,
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
      livePrice: 214,
      deltaPrice: 15,
    });
    expect(comparison.items[1]).toMatchObject({
      instanceId: 3,
      status: "unavailable",
      livePrice: null,
    });
  });
});
