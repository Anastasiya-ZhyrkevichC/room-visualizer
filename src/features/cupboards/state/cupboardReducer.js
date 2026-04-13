import { defaultStarterCabinetId, getStarterCabinet } from "../model/catalog";
import { ROTATION_STEP, getNormalizedRotation } from "../model/geometry";
import {
  alignCupboardToWall,
  createPlacementPreview,
  createCupboard,
  getWallAlignedPreviewPosition,
  getWallAlignedRotation,
  isPlacementWall,
} from "../model/placement";

export const initialCupboardState = {
  cupboards: [],
  placementPreview: null,
  activeMove: null,
  selectedCupboardId: null,
  nextCupboardId: 1,
};

const findCupboardById = (cupboards, cupboardId) => cupboards.find((cupboard) => cupboard.id === cupboardId) ?? null;

const updateCupboardById = (cupboards, cupboardId, updater) =>
  cupboards.map((cupboard) => (cupboard.id === cupboardId ? updater(cupboard) : cupboard));

const clearActiveMove = (state) => {
  if (!state.activeMove) {
    return state;
  }

  return {
    ...state,
    activeMove: null,
  };
};

const cancelActiveMove = (state) => {
  if (!state.activeMove) {
    return state;
  }

  return {
    ...state,
    cupboards: updateCupboardById(state.cupboards, state.activeMove.cupboardId, (cupboard) => ({
      ...cupboard,
      position: state.activeMove.initialPosition,
    })),
    activeMove: null,
  };
};

export const cupboardReducer = (state, action) => {
  switch (action.type) {
    case "START_PLACEMENT_PREVIEW": {
      const nextState = cancelActiveMove(state);
      const cabinet = getStarterCabinet(action.payload.catalogId ?? defaultStarterCabinetId);

      return {
        ...nextState,
        placementPreview: createPlacementPreview(cabinet, action.payload.roomBounds),
        selectedCupboardId: null,
      };
    }

    case "UPDATE_PLACEMENT_PREVIEW": {
      if (!state.placementPreview) {
        return state;
      }

      if (!isPlacementWall(action.payload.wall) || !action.payload.point) {
        return {
          ...state,
          placementPreview: {
            ...state.placementPreview,
            wall: null,
            isValid: false,
          },
        };
      }

      const nextRotation = getWallAlignedRotation(action.payload.wall);

      return {
        ...state,
        placementPreview: {
          ...state.placementPreview,
          wall: action.payload.wall,
          rotation: nextRotation,
          isValid: true,
          position: getWallAlignedPreviewPosition(
            state.placementPreview.size,
            action.payload.point,
            action.payload.roomBounds,
            action.payload.wall,
            nextRotation,
          ),
        },
      };
    }

    case "FINISH_PLACEMENT_PREVIEW": {
      if (!state.placementPreview) {
        return state;
      }

      if (!state.placementPreview.isValid || !isPlacementWall(state.placementPreview.wall)) {
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

    case "SELECT_CUPBOARD": {
      const nextState = clearActiveMove(state);

      return {
        ...nextState,
        placementPreview: null,
        selectedCupboardId: action.payload.cupboardId,
      };
    }

    case "CLEAR_SELECTION": {
      const nextState = cancelActiveMove(state);

      return {
        ...nextState,
        placementPreview: null,
        selectedCupboardId: null,
      };
    }

    case "START_CUPBOARD_MOVE": {
      const nextState = cancelActiveMove(state);
      const cupboard = findCupboardById(nextState.cupboards, action.payload.cupboardId);

      if (!cupboard) {
        return nextState;
      }

      return {
        ...nextState,
        placementPreview: null,
        activeMove: {
          cupboardId: cupboard.id,
          wall: cupboard.wall,
          initialPosition: { ...cupboard.position },
          isValid: true,
        },
        selectedCupboardId: cupboard.id,
      };
    }

    case "UPDATE_CUPBOARD_MOVE": {
      if (!state.activeMove) {
        return state;
      }

      const cupboard = findCupboardById(state.cupboards, state.activeMove.cupboardId);

      if (!cupboard) {
        return clearActiveMove(state);
      }

      if (state.activeMove.wall !== action.payload.wall || !action.payload.point) {
        return {
          ...state,
          activeMove: {
            ...state.activeMove,
            isValid: false,
          },
        };
      }

      return {
        ...state,
        cupboards: updateCupboardById(state.cupboards, cupboard.id, (currentCupboard) => ({
          ...currentCupboard,
          position: getWallAlignedPreviewPosition(
            currentCupboard.size,
            action.payload.point,
            action.payload.roomBounds,
            currentCupboard.wall,
            currentCupboard.rotation,
          ),
        })),
        activeMove: {
          ...state.activeMove,
          isValid: true,
        },
      };
    }

    case "FINISH_CUPBOARD_MOVE": {
      if (!state.activeMove) {
        return state;
      }

      return state.activeMove.isValid ? clearActiveMove(state) : cancelActiveMove(state);
    }

    case "CANCEL_CUPBOARD_MOVE":
      return cancelActiveMove(state);

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
            position: alignCupboardToWall(cupboard, nextRotation, action.payload.roomBounds, cupboard.wall),
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
        activeMove: null,
        placementPreview: null,
        selectedCupboardId: null,
      };
    }

    default:
      return state;
  }
};
