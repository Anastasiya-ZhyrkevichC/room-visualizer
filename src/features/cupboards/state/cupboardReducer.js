import { defaultStarterCabinetId, getStarterCabinet, resolveStarterCabinetInstance } from "../model/catalog";
import {
  cloneCupboardCustomisation,
  createInheritedCupboardCustomisation,
  getDefaultProjectCustomisation,
  normalizeProjectCustomisation,
  resolveCompatibleOverrideOrFallback,
} from "../model/customization";
import { ROTATION_STEP, getNormalizedRotation } from "../model/geometry";
import { createCupboard, createPlacementPreview, createPlacementValidationResult } from "../model/placementFactories";
import { getCupboardResizeDragOutcome, getCupboardWidthStepOutcome } from "../model/cupboardResize";
import { validatePlacementCandidate } from "../model/placementValidation";
import { alignCupboardToWall, getWallAlignedRotation } from "../model/wallAlignment";

export const initialCupboardState = {
  cupboards: [],
  projectCustomisation: getDefaultProjectCustomisation(),
  placementPreview: null,
  activeMove: null,
  activeResize: null,
  selectedCupboardId: null,
  nextCupboardId: 1,
};

const findCupboardById = (cupboards, cupboardId) => cupboards.find((cupboard) => cupboard.id === cupboardId) ?? null;

const updateCupboardById = (cupboards, cupboardId, updater) =>
  cupboards.map((cupboard) => (cupboard.id === cupboardId ? updater(cupboard) : cupboard));

const applyValidationToPlacementPreview = (placementPreview, validation) => ({
  ...placementPreview,
  wall: validation.wall,
  rotation: validation.rotation,
  position: validation.snappedPosition,
  validation,
});

const cloneCupboardSnapshot = (cupboard) => ({
  ...cupboard,
  position: cupboard?.position ? { ...cupboard.position } : cupboard?.position,
  size: Array.isArray(cupboard?.size) ? [...cupboard.size] : cupboard?.size,
  customisation: cloneCupboardCustomisation(cupboard?.customisation),
});

const getNextCupboardId = (cupboards) =>
  cupboards.reduce((currentMaxId, cupboard) => Math.max(currentMaxId, cupboard?.id ?? 0), 0) + 1;

const applyCupboardCustomisationPatch = (currentCustomisation, patch = {}) => {
  const nextCustomisation = cloneCupboardCustomisation(currentCustomisation);

  if (Object.prototype.hasOwnProperty.call(patch, "carcassId")) {
    nextCustomisation.carcassId = patch.carcassId;
  }

  if (Object.prototype.hasOwnProperty.call(patch, "facadeId")) {
    nextCustomisation.facadeId = patch.facadeId;
  }

  if (Object.prototype.hasOwnProperty.call(patch, "handleId")) {
    nextCustomisation.handleId = patch.handleId;
  }

  if (Object.prototype.hasOwnProperty.call(patch, "accessoryPresetId")) {
    nextCustomisation.accessoryPresetId = patch.accessoryPresetId;
  }

  if (Object.prototype.hasOwnProperty.call(patch, "accessoryIds")) {
    nextCustomisation.accessoryIds = patch.accessoryIds;
  }

  return nextCustomisation;
};

const normalizeCupboardCustomisation = (cupboard, projectCustomisation) => ({
  ...cupboard,
  customisation: resolveCompatibleOverrideOrFallback(
    cupboard,
    cupboard?.customisation ?? createInheritedCupboardCustomisation(),
    projectCustomisation,
  ),
});

const clearActiveMove = (state) => {
  if (!state.activeMove) {
    return state;
  }

  return {
    ...state,
    activeMove: null,
  };
};

const clearActiveResize = (state) => {
  if (!state.activeResize) {
    return state;
  }

  return {
    ...state,
    activeResize: null,
  };
};

const cancelActiveResize = (state) => {
  if (!state.activeResize) {
    return state;
  }

  return {
    ...state,
    cupboards: updateCupboardById(state.cupboards, state.activeResize.cupboardId, () =>
      cloneCupboardSnapshot(state.activeResize.initialCupboard),
    ),
    activeResize: null,
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
      const nextState = cancelActiveResize(cancelActiveMove(state));
      const cabinet = getStarterCabinet(action.payload.catalogId ?? defaultStarterCabinetId);

      return {
        ...nextState,
        placementPreview: createPlacementPreview(cabinet, action.payload.roomBounds, {
          variantId: action.payload.variantId ?? null,
        }),
        selectedCupboardId: null,
      };
    }

    case "UPDATE_PLACEMENT_PREVIEW": {
      if (!state.placementPreview) {
        return state;
      }

      const validation = validatePlacementCandidate({
        candidate: state.placementPreview,
        point: action.payload.point,
        roomBounds: action.payload.roomBounds,
        wall: action.payload.wall,
        cupboards: state.cupboards,
      });

      return {
        ...state,
        placementPreview: applyValidationToPlacementPreview(state.placementPreview, validation),
      };
    }

    case "FINISH_PLACEMENT_PREVIEW": {
      if (!state.placementPreview) {
        return state;
      }

      if (!state.placementPreview.validation?.isValid) {
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
          normalizeCupboardCustomisation(
            createCupboard({
              id: nextCupboardId,
              cabinet: state.placementPreview,
              position: state.placementPreview.position,
              rotation: state.placementPreview.rotation,
              wall: state.placementPreview.wall,
            }),
            state.projectCustomisation,
          ),
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
      const nextState = cancelActiveResize(clearActiveMove(state));

      return {
        ...nextState,
        placementPreview: null,
        selectedCupboardId: action.payload.cupboardId,
      };
    }

    case "CLEAR_SELECTION": {
      const nextState = cancelActiveResize(cancelActiveMove(state));

      return {
        ...nextState,
        placementPreview: null,
        selectedCupboardId: null,
      };
    }

    case "START_CUPBOARD_MOVE": {
      const nextState = cancelActiveResize(cancelActiveMove(state));
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
          validation: createPlacementValidationResult({
            isValid: true,
            reason: null,
            wall: cupboard.wall,
            rotation: cupboard.rotation,
            snappedPosition: cupboard.position,
          }),
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

      const validation = validatePlacementCandidate({
        candidate: cupboard,
        point: action.payload.point,
        roomBounds: action.payload.roomBounds,
        wall: action.payload.wall,
        cupboards: state.cupboards,
      });

      return {
        ...state,
        cupboards: updateCupboardById(state.cupboards, cupboard.id, (currentCupboard) => ({
          ...currentCupboard,
          position: validation.snappedPosition,
          rotation: validation.rotation,
        })),
        activeMove: {
          ...state.activeMove,
          validation,
        },
      };
    }

    case "FINISH_CUPBOARD_MOVE": {
      if (!state.activeMove) {
        return state;
      }

      return state.activeMove.validation?.isValid ? clearActiveMove(state) : cancelActiveMove(state);
    }

    case "CANCEL_CUPBOARD_MOVE":
      return cancelActiveMove(state);

    case "START_CUPBOARD_RESIZE": {
      const nextState = cancelActiveResize(cancelActiveMove(state));
      const cupboard = findCupboardById(nextState.cupboards, action.payload.cupboardId);

      if (!cupboard || (cupboard.availableWidths?.length ?? 0) < 2) {
        return nextState;
      }

      return {
        ...nextState,
        placementPreview: null,
        activeResize: {
          cupboardId: cupboard.id,
          wall: cupboard.wall,
          side: action.payload.side,
          initialCupboard: cloneCupboardSnapshot(cupboard),
          validation: createPlacementValidationResult({
            isValid: true,
            reason: null,
            wall: cupboard.wall,
            rotation: cupboard.rotation,
            snappedPosition: cupboard.position,
          }),
        },
        selectedCupboardId: cupboard.id,
      };
    }

    case "UPDATE_CUPBOARD_RESIZE": {
      if (!state.activeResize) {
        return state;
      }

      const currentCupboard = findCupboardById(state.cupboards, state.activeResize.cupboardId);

      if (!currentCupboard) {
        return clearActiveResize(state);
      }

      if (action.payload.wall !== state.activeResize.wall || !action.payload.point) {
        return {
          ...state,
          activeResize: {
            ...state.activeResize,
            validation: createPlacementValidationResult({
              isValid: false,
              reason: null,
              wall: null,
              rotation: currentCupboard.rotation,
              snappedPosition: currentCupboard.position,
            }),
          },
        };
      }

      const resizeOutcome = getCupboardResizeDragOutcome({
        cupboard: state.activeResize.initialCupboard,
        point: action.payload.point,
        side: state.activeResize.side,
        roomBounds: action.payload.roomBounds,
        cupboards: state.cupboards,
      });

      if (!resizeOutcome.cupboard || !resizeOutcome.validation) {
        return state;
      }

      return {
        ...state,
        cupboards: updateCupboardById(state.cupboards, currentCupboard.id, () =>
          normalizeCupboardCustomisation(resizeOutcome.cupboard, state.projectCustomisation),
        ),
        activeResize: {
          ...state.activeResize,
          validation: resizeOutcome.validation,
        },
      };
    }

    case "FINISH_CUPBOARD_RESIZE": {
      if (!state.activeResize) {
        return state;
      }

      return state.activeResize.validation?.isValid ? clearActiveResize(state) : cancelActiveResize(state);
    }

    case "CANCEL_CUPBOARD_RESIZE":
      return cancelActiveResize(state);

    case "ROTATE_SELECTED_CUPBOARD": {
      if (state.selectedCupboardId === null || state.activeMove || state.activeResize || state.placementPreview) {
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
        activeResize: null,
        placementPreview: null,
        selectedCupboardId: null,
      };
    }

    case "REPLACE_SELECTED_CUPBOARD": {
      if (state.selectedCupboardId === null || state.activeMove || state.activeResize || state.placementPreview) {
        return state;
      }

      const selectedCupboard = findCupboardById(state.cupboards, state.selectedCupboardId);

      if (!selectedCupboard) {
        return state;
      }

      const replacementSource = resolveStarterCabinetInstance(getStarterCabinet(action.payload.catalogId), {
        useDefaultVariant: true,
      });

      if (!replacementSource) {
        return state;
      }

      const replacementCupboard = createCupboard({
        id: selectedCupboard.id,
        cabinet: {
          ...replacementSource,
          customisation: selectedCupboard.customisation,
        },
        position: selectedCupboard.position,
        rotation: getWallAlignedRotation(selectedCupboard.wall),
        wall: selectedCupboard.wall,
      });
      const validation = validatePlacementCandidate({
        candidate: replacementCupboard,
        point: replacementCupboard.position,
        roomBounds: action.payload.roomBounds,
        wall: selectedCupboard.wall,
        cupboards: state.cupboards,
      });

      if (!validation.isValid || !validation.wall || !validation.snappedPosition) {
        return state;
      }

      return {
        ...state,
        cupboards: updateCupboardById(state.cupboards, selectedCupboard.id, () => ({
          ...normalizeCupboardCustomisation(replacementCupboard, state.projectCustomisation),
          position: validation.snappedPosition,
          rotation: validation.rotation,
          wall: validation.wall,
        })),
      };
    }

    case "STEP_SELECTED_CUPBOARD_WIDTH": {
      if (state.selectedCupboardId === null || state.activeMove || state.activeResize || state.placementPreview) {
        return state;
      }

      const selectedCupboard = findCupboardById(state.cupboards, state.selectedCupboardId);

      if (!selectedCupboard) {
        return state;
      }

      const widthStepOutcome = getCupboardWidthStepOutcome({
        cupboard: selectedCupboard,
        direction: action.payload.direction,
        side: action.payload.side,
        roomBounds: action.payload.roomBounds,
        cupboards: state.cupboards,
      });

      if (!widthStepOutcome.isAvailable || !widthStepOutcome.cupboard) {
        return state;
      }

      return {
        ...state,
        cupboards: updateCupboardById(state.cupboards, selectedCupboard.id, () =>
          normalizeCupboardCustomisation(widthStepOutcome.cupboard, state.projectCustomisation),
        ),
      };
    }

    case "UPDATE_PROJECT_CUSTOMISATION":
      return {
        ...state,
        projectCustomisation: normalizeProjectCustomisation({
          ...state.projectCustomisation,
          ...(action.payload ?? {}),
        }),
      };

    case "UPDATE_CUPBOARD_CUSTOMISATION": {
      const cupboard = findCupboardById(state.cupboards, action.payload?.cupboardId);

      if (!cupboard || cupboard.isUnavailable) {
        return state;
      }

      return {
        ...state,
        cupboards: updateCupboardById(state.cupboards, cupboard.id, (currentCupboard) =>
          normalizeCupboardCustomisation(
            {
              ...currentCupboard,
              customisation: applyCupboardCustomisationPatch(currentCupboard.customisation, action.payload?.patch),
            },
            state.projectCustomisation,
          ),
        ),
      };
    }

    case "RESET_CUPBOARD_CUSTOMISATION": {
      const cupboard = findCupboardById(state.cupboards, action.payload?.cupboardId);

      if (!cupboard || cupboard.isUnavailable) {
        return state;
      }

      return {
        ...state,
        cupboards: updateCupboardById(state.cupboards, cupboard.id, (currentCupboard) => ({
          ...currentCupboard,
          customisation: createInheritedCupboardCustomisation(),
        })),
      };
    }

    case "LOAD_PROJECT": {
      const nextProjectCustomisation = normalizeProjectCustomisation(action.payload?.projectCustomisation);
      const nextCupboards = Array.isArray(action.payload?.cupboards)
        ? action.payload.cupboards.map((cupboard) =>
            normalizeCupboardCustomisation(cloneCupboardSnapshot(cupboard), nextProjectCustomisation),
          )
        : [];

      return {
        ...state,
        cupboards: nextCupboards,
        projectCustomisation: nextProjectCustomisation,
        placementPreview: null,
        activeMove: null,
        activeResize: null,
        selectedCupboardId: null,
        nextCupboardId: getNextCupboardId(nextCupboards),
      };
    }

    default:
      return state;
  }
};
