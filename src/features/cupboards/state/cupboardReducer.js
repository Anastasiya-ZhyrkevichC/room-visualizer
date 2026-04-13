import { defaultStarterCabinetId, getStarterCabinet } from "../model/catalog";
import { ROTATION_STEP, getNormalizedRotation } from "../model/geometry";
import {
  alignCupboardToBackWall,
  createCupboard,
  createInitialCupboardPosition,
  getAttachedCupboardPosition,
} from "../model/placement";

export const initialCupboardState = {
  cupboards: [],
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
        selectedCupboardId: nextCupboardId,
        nextCupboardId: nextCupboardId + 1,
      };
    }

    case "SELECT_CUPBOARD":
      return {
        ...state,
        selectedCupboardId: action.payload.cupboardId,
      };

    case "CLEAR_SELECTION":
      return {
        ...state,
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
        selectedCupboardId: null,
      };
    }

    default:
      return state;
  }
};
