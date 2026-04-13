import { defaultStarterCabinetId, getStarterCabinet } from "../model/catalog";
import { ROTATION_STEP, getNormalizedRotation } from "../model/geometry";
import {
  BACK_WALL_ID,
  alignCupboardToBackWall,
  createPlacementPreview,
  createCupboard,
  createInitialCupboardPosition,
  getBackWallAlignedPreviewPosition,
  getAttachedCupboardPosition,
} from "../model/placement";

export const initialCupboardState = {
  cupboards: [],
  placementPreview: null,
  selectedCupboardId: null,
  nextCupboardId: 1,
};

export const cupboardReducer = (state, action) => {
  switch (action.type) {
    case "ADD_CUPBOARD": {
      const cabinet = getStarterCabinet(action.payload.catalogId ?? defaultStarterCabinetId);
      const nextCupboardId = state.nextCupboardId;
      const position =
        state.cupboards.length === 0
          ? createInitialCupboardPosition(cabinet.size, action.payload.roomBounds)
          : getAttachedCupboardPosition(state.cupboards[state.cupboards.length - 1], cabinet.size);

      return {
        ...state,
        cupboards: [...state.cupboards, createCupboard({ id: nextCupboardId, cabinet, position })],
        placementPreview: null,
        selectedCupboardId: nextCupboardId,
        nextCupboardId: nextCupboardId + 1,
      };
    }

    case "START_PLACEMENT_PREVIEW": {
      const cabinet = getStarterCabinet(action.payload.catalogId ?? defaultStarterCabinetId);

      return {
        ...state,
        placementPreview: createPlacementPreview(cabinet, action.payload.roomBounds),
        selectedCupboardId: null,
      };
    }

    case "UPDATE_PLACEMENT_PREVIEW": {
      if (!state.placementPreview) {
        return state;
      }

      if (action.payload.wall !== BACK_WALL_ID || !action.payload.point) {
        return {
          ...state,
          placementPreview: {
            ...state.placementPreview,
            wall: null,
            isValid: false,
          },
        };
      }

      return {
        ...state,
        placementPreview: {
          ...state.placementPreview,
          wall: BACK_WALL_ID,
          isValid: true,
          position: getBackWallAlignedPreviewPosition(
            state.placementPreview.size,
            action.payload.point,
            action.payload.roomBounds,
            state.placementPreview.rotation,
          ),
        },
      };
    }

    case "FINISH_PLACEMENT_PREVIEW": {
      if (!state.placementPreview) {
        return state;
      }

      if (!state.placementPreview.isValid || state.placementPreview.wall !== BACK_WALL_ID) {
        return {
          ...state,
          placementPreview: null,
        };
      }

      const nextCupboardId = state.nextCupboardId;

      return {
        ...state,
        cupboards: [
          ...state.cupboards,
          createCupboard({
            id: nextCupboardId,
            cabinet: state.placementPreview,
            position: state.placementPreview.position,
            rotation: state.placementPreview.rotation,
            wall: state.placementPreview.wall,
          }),
        ],
        placementPreview: null,
        selectedCupboardId: nextCupboardId,
        nextCupboardId: nextCupboardId + 1,
      };
    }

    case "CANCEL_PLACEMENT_PREVIEW":
      return {
        ...state,
        placementPreview: null,
      };

    case "SELECT_CUPBOARD":
      return {
        ...state,
        placementPreview: null,
        selectedCupboardId: action.payload.cupboardId,
      };

    case "CLEAR_SELECTION":
      return {
        ...state,
        placementPreview: null,
        selectedCupboardId: null,
      };

    case "ROTATE_SELECTED_CUPBOARD": {
      if (state.selectedCupboardId === null) {
        return state;
      }

      return {
        ...state,
        cupboards: state.cupboards.map((cupboard) => {
          if (cupboard.id !== state.selectedCupboardId) {
            return cupboard;
          }

          const nextRotation = getNormalizedRotation(cupboard.rotation + ROTATION_STEP);

          return {
            ...cupboard,
            rotation: nextRotation,
            position: alignCupboardToBackWall(cupboard, nextRotation, action.payload.roomBounds),
          };
        }),
      };
    }

    case "DELETE_SELECTED_CUPBOARD": {
      if (state.selectedCupboardId === null) {
        return state;
      }

      return {
        ...state,
        cupboards: state.cupboards.filter((cupboard) => cupboard.id !== state.selectedCupboardId),
        placementPreview: null,
        selectedCupboardId: null,
      };
    }

    default:
      return state;
  }
};
