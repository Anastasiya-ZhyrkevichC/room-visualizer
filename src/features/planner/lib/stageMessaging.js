import { LEFT_WALL_ID, RIGHT_WALL_ID, getPlacementValidationReasonLabel } from "../../cupboards/model/placement";

export const getWallLabel = (wall) =>
  wall === LEFT_WALL_ID ? "left wall" : wall === RIGHT_WALL_ID ? "right wall" : "back wall";

export const getPlannerStageViewModel = ({
  activeMove,
  isMoveActive,
  isPlacementActive,
  placementPreview,
  selectedCupboard,
}) => {
  const placementValidation = placementPreview?.validation;
  const moveValidation = activeMove?.validation;
  const isPlacementInvalid = Boolean(isPlacementActive && placementValidation?.isValid === false);
  const isMoveInvalid = Boolean(isMoveActive && moveValidation?.isValid === false);
  const placementWallLabel = getWallLabel(placementPreview?.wall);
  const placementReasonLabel = getPlacementValidationReasonLabel(placementValidation?.reason);
  const moveWallLabel = getWallLabel(selectedCupboard?.wall);
  const moveReasonLabel = getPlacementValidationReasonLabel(moveValidation?.reason);

  const selectionBadge = isPlacementActive
    ? `${isPlacementInvalid ? "Preview invalid" : "Previewing"} ${placementPreview.name}`
    : isMoveActive && selectedCupboard
      ? `${isMoveInvalid ? "Invalid move" : "Moving"} ${selectedCupboard.name}`
      : selectedCupboard
        ? `${selectedCupboard.name} selected`
        : "Click a cabinet to select it";

  const placementHint = placementValidation?.isValid
    ? `Release to place this cabinet on the ${placementWallLabel}.`
    : placementReasonLabel
      ? `${placementReasonLabel}. Drag back over the back, left, or right wall to find a valid position. Release now to cancel this preview, or press Escape to cancel.`
      : "Move over the back, left, or right wall to position the preview. Release now to cancel this preview, or press Escape to cancel.";

  const moveHint =
    isMoveActive && selectedCupboard
      ? moveValidation?.isValid
        ? `Drag along the ${moveWallLabel} and release to keep the cabinet in its new position.`
        : moveReasonLabel
          ? `${moveReasonLabel}. Drag back to a valid position on the ${moveWallLabel}. Release now to restore the previous position, or press Escape to restore it.`
          : `Move back onto the ${moveWallLabel}. Release now to restore the previous position, or press Escape to restore it.`
      : selectedCupboard
        ? `Drag the selected cabinet in the scene to reposition it along the ${moveWallLabel}.`
        : null;

  return {
    selectionBadge,
    stageHint: isPlacementActive ? placementHint : moveHint,
    isStageInvalid: isPlacementInvalid || isMoveInvalid,
  };
};
