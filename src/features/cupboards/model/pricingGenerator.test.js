const pricingConfig = require("../../../../config/cabinet-pricing.config.json");
const starterCabinetCatalogDefinitions = require("./starterCabinetCatalogDefinitions.json");
const { buildPricingBreakdownDefinitions, getPricingBreakdown } = require("../../../../scripts/lib/cabinet-pricing");

describe("pricing breakdown generator", () => {
  it("captures the script-level price inputs and totals for a base cabinet variant", () => {
    const cabinet = starterCabinetCatalogDefinitions.find(({ id }) => id === "base-double-door");
    const variant = cabinet.variants.find(({ width }) => width === 300);
    const breakdown = getPricingBreakdown({
      cabinet,
      variant,
      config: pricingConfig,
    });

    expect(breakdown.variantId).toBe("300x720x560");
    expect(breakdown.measurements.areaMm2ByGroup).toEqual({
      body: 978880,
      backPanel: 151536,
      shelf: 140976,
      facade: 176952,
    });
    expect(breakdown.componentCounts).toMatchObject({
      shelfCount: 1,
      doorCount: 2,
      handleCount: 2,
      legCount: 4,
      doorHingeCount: 4,
    });
    expect(breakdown.inputs.carcaseMaterial).toEqual({
      bodyPanelPricePerSquareMeter: 21.22,
      backPanelPricePerSquareMeter: 26,
      shelfPricePerSquareMeter: 21.22,
      edgeBandingPricePerMeter: 1,
    });
    expect(breakdown.inputs.facadeMaterial).toEqual({
      pricePerSquareMeter: 108,
      edgeBandingPricePerMeter: 2,
    });
    expect(breakdown.inputs.handle).toEqual({
      unitPrice: 8,
    });
    expect(breakdown.inputs.leg).toEqual({
      unitPrice: 100,
    });
    expect(breakdown.costs.bodyCost).toBeCloseTo(20.7718336, 6);
    expect(breakdown.costs.backPanelCost).toBeCloseTo(3.939936, 6);
    expect(breakdown.costs.shelfCost).toBeCloseTo(2.99151072, 6);
    expect(breakdown.costs.bodyEdgeBandingCost).toBeCloseTo(2.012, 6);
    expect(breakdown.costs.bodyPanelsPanelCost).toBeCloseTo(23.76334432, 6);
    expect(breakdown.costs.totalBodyPanelsCost).toBeCloseTo(25.77534432, 6);
    expect(breakdown.costs.facadeCost).toBeCloseTo(19.110816, 6);
    expect(breakdown.costs.facadeEdgeBandingCost).toBeCloseTo(6.016, 6);
    expect(breakdown.costs.totalFacadeCost).toBeCloseTo(25.126816, 6);
    expect(breakdown.costs.handleCost).toBe(16);
    expect(breakdown.costs.legCost).toBe(400);
    expect(breakdown.costs.hingeCost).toBe(10);
    expect(breakdown.costs.subtotal).toBeCloseTo(480.84209632, 6);
    expect(breakdown.costs.totalBeforeRounding).toBeCloseTo(480.84209632, 6);
    expect(breakdown.costs.roundedPrice).toBe(481);
  });

  it("builds a serializable generated breakdown file for every cabinet variant", () => {
    const output = buildPricingBreakdownDefinitions(starterCabinetCatalogDefinitions, pricingConfig);

    expect(output).toMatchObject({
      schemaVersion: 3,
      currency: "USD",
      roundingNearest: 1,
    });

    const drawerCabinet = output.cabinets.find(({ cabinetId }) => cabinetId === "base-three-drawer");
    const wideDrawerVariant = drawerCabinet.variants.find(({ variantId }) => variantId === "900x720x560");
    const baseVariant = output.cabinets.find(({ cabinetId }) => cabinetId === "base-double-door").variants[0];

    expect(Object.keys(output).sort()).toEqual(["cabinets", "currency", "roundingNearest", "schemaVersion"]);
    expect(Object.keys(baseVariant).sort()).toEqual([
      "roundedPrice",
      "steps",
      "subtotal",
      "totalBeforeRounding",
      "variantId",
    ]);

    expect(wideDrawerVariant).toMatchObject({
      variantId: "900x720x560",
      steps: {
        bodyPanels: {
          areaM2: 1.65088,
          unitPricePerSquareMeter: 21.22,
          panelCost: 35.0317,
          edgeLengthM: 2.948,
          edgeBandingPricePerMeter: 1,
          edgeCost: 2.948,
          cost: 37.9797,
        },
        backPanel: {
          areaM2: 0.495936,
          unitPricePerSquareMeter: 26,
          cost: 12.8943,
        },
        facade: {
          areaM2: 0.535808,
          unitPricePerSquareMeter: 118,
          panelCost: 63.2253,
          edgeLengthM: 6.572,
          edgeBandingPricePerMeter: 2,
          edgeCost: 13.144,
          cost: 76.3693,
        },
        handles: {
          count: 3,
          unitPrice: 11,
          cost: 33,
        },
        legs: {
          count: 6,
          unitPrice: 100,
          cost: 600,
        },
        drawerBoxes: {
          count: 3,
          unitPrice: 26,
          cost: 78,
        },
      },
      subtotal: 838.2434,
      totalBeforeRounding: 838.2434,
      roundedPrice: 838,
    });
    expect(wideDrawerVariant.steps.hinges).toBeUndefined();
    expect(wideDrawerVariant.steps.wallMountingKits).toBeUndefined();
    expect(wideDrawerVariant.steps.assembly).toBeUndefined();
    expect(wideDrawerVariant.steps.extraFixed).toBeUndefined();
  });
});
