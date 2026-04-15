import { BACK_WALL_ID, PLACEMENT_VALIDATION_REASONS } from "../../cupboards/model/placement";
import { getPlannerStageViewModel } from "./stageMessaging";

describe("planner stage messaging", () => {
  it("marks invalid placement previews and explains that releasing cancels the preview", () => {
    const viewModel = getPlannerStageViewModel({
      activeMove: null,
      isMoveActive: false,
      isPlacementActive: true,
      placementPreview: {
        name: "Double-door base 600",
        wall: BACK_WALL_ID,
        validation: {
          isValid: false,
          reason: PLACEMENT_VALIDATION_REASONS.OVERLAP,
        },
      },
      selectedCupboard: null,
    });

    expect(viewModel).toMatchObject({
      selectionBadge: "Preview invalid Double-door base 600",
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
        name: "Three-drawer base 900",
        wall: BACK_WALL_ID,
      },
    });

    expect(viewModel).toMatchObject({
      selectionBadge: "Invalid move Three-drawer base 900",
      isStageInvalid: true,
    });
    expect(viewModel.stageHint).toContain("Leave no gap between cabinets.");
    expect(viewModel.stageHint).toContain("Release now to restore the previous position");
  });

  it("keeps valid placement messaging unchanged", () => {
    const viewModel = getPlannerStageViewModel({
      activeMove: null,
      isMoveActive: false,
      isPlacementActive: true,
      placementPreview: {
        name: "Double-door base 600",
        wall: BACK_WALL_ID,
        validation: {
          isValid: true,
          reason: null,
        },
      },
      selectedCupboard: null,
    });

    expect(viewModel).toEqual({
      selectionBadge: "Previewing Double-door base 600",
      stageHint: "Release to place this cabinet on the back wall.",
      isStageInvalid: false,
    });
  });
});
