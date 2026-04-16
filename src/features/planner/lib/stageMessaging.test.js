import { BACK_WALL_ID, PLACEMENT_VALIDATION_REASONS } from "../../cupboards/model/placement";
import { getPlannerStageViewModel } from "./stageMessaging";

describe("planner stage messaging", () => {
  it("marks invalid placement previews and explains that releasing cancels the preview", () => {
    const viewModel = getPlannerStageViewModel({
      activeMove: null,
      isMoveActive: false,
      isPlacementActive: true,
      placementPreview: {
        name: "Double-door base cabinet",
        wall: BACK_WALL_ID,
        validation: {
          isValid: false,
          reason: PLACEMENT_VALIDATION_REASONS.OVERLAP,
        },
      },
      selectedCupboard: null,
    });

    expect(viewModel).toMatchObject({
      selectionBadge: "Preview invalid Double-door base cabinet",
      isStageInvalid: true,
    });
    expect(viewModel.stageHint).toContain("Overlaps another cabinet.");
    expect(viewModel.stageHint).toContain("Release now to cancel this preview");
  });

  it("marks invalid moves and explains that releasing restores the previous position", () => {
    const viewModel = getPlannerStageViewModel({
      activeMove: {
        validation: {
          isValid: false,
          reason: PLACEMENT_VALIDATION_REASONS.ADJACENCY_GAP,
        },
      },
      isMoveActive: true,
      isPlacementActive: false,
      placementPreview: null,
      selectedCupboard: {
        name: "Three-drawer base cabinet",
        wall: BACK_WALL_ID,
      },
    });

    expect(viewModel).toMatchObject({
      selectionBadge: "Invalid move Three-drawer base cabinet",
      isStageInvalid: true,
    });
    expect(viewModel.stageHint).toContain("Leave no gap between cabinets.");
    expect(viewModel.stageHint).toContain("Release now to restore the previous position");
  });

  it("surfaces the corner-collision reason through invalid placement messaging", () => {
    const viewModel = getPlannerStageViewModel({
      activeMove: null,
      isMoveActive: false,
      isPlacementActive: true,
      placementPreview: {
        name: "Double-door base cabinet",
        wall: BACK_WALL_ID,
        validation: {
          isValid: false,
          reason: PLACEMENT_VALIDATION_REASONS.CORNER_COLLISION,
        },
      },
      selectedCupboard: null,
    });

    expect(viewModel).toMatchObject({
      selectionBadge: "Preview invalid Double-door base cabinet",
      isStageInvalid: true,
    });
    expect(viewModel.stageHint).toContain("Intersects a cabinet near the corner.");
    expect(viewModel.stageHint).toContain("Release now to cancel this preview");
  });

  it("describes a placement preview that is being held flush by magnetic snapping", () => {
    const viewModel = getPlannerStageViewModel({
      activeMove: null,
      isMoveActive: false,
      isPlacementActive: true,
      placementPreview: {
        name: "Double-door base cabinet",
        wall: BACK_WALL_ID,
        validation: {
          isValid: true,
          reason: null,
          isMagneticallySnapped: true,
        },
      },
      selectedCupboard: null,
    });

    expect(viewModel).toMatchObject({
      selectionBadge: "Previewing Double-door base cabinet",
      isStageInvalid: false,
    });
    expect(viewModel.stageHint).toContain("Held flush against the neighboring cabinet");
    expect(viewModel.stageHint).toContain("Release to place it there");
  });

  it("describes a move that is being held flush by magnetic snapping", () => {
    const viewModel = getPlannerStageViewModel({
      activeMove: {
        validation: {
          isValid: true,
          reason: null,
          isMagneticallySnapped: true,
        },
      },
      isMoveActive: true,
      isPlacementActive: false,
      placementPreview: null,
      selectedCupboard: {
        name: "Three-drawer base cabinet",
        wall: BACK_WALL_ID,
      },
    });

    expect(viewModel).toMatchObject({
      selectionBadge: "Moving Three-drawer base cabinet",
      isStageInvalid: false,
    });
    expect(viewModel.stageHint).toContain("Held flush against the neighboring cabinet");
    expect(viewModel.stageHint).toContain("Release to keep it there");
  });

  it("keeps valid placement messaging unchanged", () => {
    const viewModel = getPlannerStageViewModel({
      activeMove: null,
      isMoveActive: false,
      isPlacementActive: true,
      placementPreview: {
        name: "Double-door base cabinet",
        wall: BACK_WALL_ID,
        validation: {
          isValid: true,
          reason: null,
        },
      },
      selectedCupboard: null,
    });

    expect(viewModel).toEqual({
      selectionBadge: "Previewing Double-door base cabinet",
      stageHint: "Release to place this cabinet on the back wall.",
      isStageInvalid: false,
    });
  });
});
