import { CUPBOARD_RESIZE_SIDES } from "../../cupboards/model/placementConstants";
import { getPlacementValidationReasonLabel } from "../../cupboards/model/placementValidation";
import { LEFT_WALL_ID, RIGHT_WALL_ID } from "../../cupboards/model/walls";
import { formatSelectionResizeHint } from "./roomFormatting";

export const getWallLabel = (wall) =>
  wall === LEFT_WALL_ID ? "left wall" : wall === RIGHT_WALL_ID ? "right wall" : "back wall";

const getResizeHandleLabel = (side) =>
  side === CUPBOARD_RESIZE_SIDES.RIGHT ? "right handle" : side === CUPBOARD_RESIZE_SIDES.LEFT ? "left handle" : null;

export const getPlannerStageViewModel = ({
  activeMove,
  activeResize,
  isMoveActive,
  isPlacementActive,
  isResizeActive,
  placementPreview,
  selectedCupboard,
}) => {
  const placementValidation = placementPreview?.validation;
  const moveValidation = activeMove?.validation;
  const resizeValidation = activeResize?.validation;
  const isPlacementInvalid = Boolean(isPlacementActive && placementValidation?.isValid === false);
  const isMoveInvalid = Boolean(isMoveActive && moveValidation?.isValid === false);
  const isResizeInvalid = Boolean(isResizeActive && resizeValidation?.isValid === false);
  const placementWallLabel = getWallLabel(placementPreview?.wall);
  const placementReasonLabel = getPlacementValidationReasonLabel(placementValidation?.reason);
  const moveWallLabel = getWallLabel(selectedCupboard?.wall);
  const moveReasonLabel = getPlacementValidationReasonLabel(moveValidation?.reason);
  const resizeWallLabel = getWallLabel(activeResize?.wall ?? selectedCupboard?.wall);
  const resizeHandleLabel = getResizeHandleLabel(activeResize?.side);
  const resizeReasonLabel = getPlacementValidationReasonLabel(resizeValidation?.reason);

  const selectionBadge = isPlacementActive
    ? `${isPlacementInvalid ? "Preview invalid" : "Previewing"} ${placementPreview.name}`
    : isMoveActive && selectedCupboard
      ? `${isMoveInvalid ? "Invalid move" : "Moving"} ${selectedCupboard.name}`
      : isResizeActive && selectedCupboard
        ? `${isResizeInvalid ? "Invalid resize" : "Resizing"} ${selectedCupboard.name}`
        : selectedCupboard
          ? `${selectedCupboard.name} selected`
          : "Click a cabinet to select it";

  const placementHint = placementValidation?.isValid
    ? placementValidation?.isMagneticallySnapped
      ? `Held flush against the neighboring cabinet on the ${placementWallLabel}. Release to place it there, or drag away to keep moving freely.`
      : `Release to place this cabinet on the ${placementWallLabel}.`
    : placementReasonLabel
      ? `${placementReasonLabel}. Drag back over the back, left, or right wall to find a valid position. Release now to cancel this preview, or press Escape to cancel.`
      : "Move over the back, left, or right wall to position the preview. Release now to cancel this preview, or press Escape to cancel.";

  const moveHint =
    isMoveActive && selectedCupboard
      ? moveValidation?.isValid
        ? moveValidation?.isMagneticallySnapped
          ? `Held flush against the neighboring cabinet on the ${moveWallLabel}. Release to keep it there, or drag away to continue moving freely.`
          : `Drag along the ${moveWallLabel} and release to keep the cabinet in its new position.`
        : moveReasonLabel
          ? `${moveReasonLabel}. Drag back to a valid position on the ${moveWallLabel}. Release now to restore the previous position, or press Escape to restore it.`
          : `Move back onto the ${moveWallLabel}. Release now to restore the previous position, or press Escape to restore it.`
      : selectedCupboard
        ? formatSelectionResizeHint(moveWallLabel)
        : null;

  const resizeHint =
    isResizeActive && selectedCupboard
      ? resizeValidation?.isValid
        ? `Drag the ${resizeHandleLabel} along the ${resizeWallLabel} and release to keep this width.`
        : resizeReasonLabel
          ? `${resizeReasonLabel}. Drag the ${resizeHandleLabel} back to a valid width on the ${resizeWallLabel}. Release now to restore the previous width, or press Escape to restore it.`
          : `Move the ${resizeHandleLabel} back onto the ${resizeWallLabel}. Release now to restore the previous width, or press Escape to restore it.`
      : null;

  return {
    selectionBadge,
    stageHint: isPlacementActive ? placementHint : isMoveActive ? moveHint : (resizeHint ?? moveHint),
    isStageInvalid: isPlacementInvalid || isMoveInvalid || isResizeInvalid,
  };
};
