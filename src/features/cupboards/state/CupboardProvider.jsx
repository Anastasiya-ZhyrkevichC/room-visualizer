import React, { createContext, useContext, useMemo, useReducer } from "react";

import { useRoomScene } from "../../room/context/RoomSceneContext";
import { CUPBOARD_RESIZE_SIDES } from "../model/placementConstants";
import {
  selectInheritedCupboardCount,
  selectPricingSummary,
  selectProjectCustomisation,
  selectSelectedCupboard,
  selectSelectedCupboardResolvedCustomisation,
  selectSelectedPricingLineItem,
  selectTableTopRuns,
} from "../selectors";
import { cupboardReducer, initialCupboardState } from "./cupboardReducer";

const CupboardContext = createContext(null);

export const CupboardProvider = ({ children }) => {
  const { bounds } = useRoomScene();
  const [state, dispatch] = useReducer(cupboardReducer, initialCupboardState);

  const selectedCupboard = selectSelectedCupboard(state);
  const selectedCupboardResolvedCustomisation = selectSelectedCupboardResolvedCustomisation(state);
  const selectedPricingLineItem = selectSelectedPricingLineItem(state);
  const pricingSummary = selectPricingSummary(state);
  const projectCustomisation = selectProjectCustomisation(state);
  const inheritedCupboardCount = selectInheritedCupboardCount(state);
  const selectedCupboardId = state.selectedCupboardId;
  const tableTopRuns = useMemo(() => selectTableTopRuns(state), [state.cupboards]);
  const actions = useMemo(
    () => ({
      startPlacementPreview: (catalogId, { variantId = null } = {}) =>
        dispatch({ type: "START_PLACEMENT_PREVIEW", payload: { catalogId, variantId, roomBounds: bounds } }),
      updatePlacementPreview: (placement) =>
        dispatch({ type: "UPDATE_PLACEMENT_PREVIEW", payload: { ...placement, roomBounds: bounds } }),
      finishPlacementPreview: () => dispatch({ type: "FINISH_PLACEMENT_PREVIEW" }),
      cancelPlacementPreview: () => dispatch({ type: "CANCEL_PLACEMENT_PREVIEW" }),
      selectCupboard: (cupboardId) => dispatch({ type: "SELECT_CUPBOARD", payload: { cupboardId } }),
      clearSelection: () => dispatch({ type: "CLEAR_SELECTION" }),
      startCupboardMove: (cupboardId) => dispatch({ type: "START_CUPBOARD_MOVE", payload: { cupboardId } }),
      updateCupboardMove: (movement) =>
        dispatch({ type: "UPDATE_CUPBOARD_MOVE", payload: { ...movement, roomBounds: bounds } }),
      finishCupboardMove: () => dispatch({ type: "FINISH_CUPBOARD_MOVE" }),
      cancelCupboardMove: () => dispatch({ type: "CANCEL_CUPBOARD_MOVE" }),
      startCupboardResize: (cupboardId, side) =>
        dispatch({ type: "START_CUPBOARD_RESIZE", payload: { cupboardId, side } }),
      updateCupboardResize: (resize) =>
        dispatch({ type: "UPDATE_CUPBOARD_RESIZE", payload: { ...resize, roomBounds: bounds } }),
      finishCupboardResize: () => dispatch({ type: "FINISH_CUPBOARD_RESIZE" }),
      cancelCupboardResize: () => dispatch({ type: "CANCEL_CUPBOARD_RESIZE" }),
      stepSelectedCupboardWidth: (direction, side) =>
        dispatch({ type: "STEP_SELECTED_CUPBOARD_WIDTH", payload: { direction, side, roomBounds: bounds } }),
      replaceSelectedCupboard: (catalogId) =>
        dispatch({ type: "REPLACE_SELECTED_CUPBOARD", payload: { catalogId, roomBounds: bounds } }),
      decreaseSelectedCupboardWidth: (side = CUPBOARD_RESIZE_SIDES.LEFT) =>
        dispatch({
          type: "STEP_SELECTED_CUPBOARD_WIDTH",
          payload: { direction: "previous", side, roomBounds: bounds },
        }),
      increaseSelectedCupboardWidth: (side = CUPBOARD_RESIZE_SIDES.RIGHT) =>
        dispatch({ type: "STEP_SELECTED_CUPBOARD_WIDTH", payload: { direction: "next", side, roomBounds: bounds } }),
      updateProjectCustomisation: (patch) => dispatch({ type: "UPDATE_PROJECT_CUSTOMISATION", payload: patch }),
      updateCupboardCustomisation: (cupboardId, patch) =>
        dispatch({ type: "UPDATE_CUPBOARD_CUSTOMISATION", payload: { cupboardId, patch } }),
      updateSelectedCupboardCustomisation: (patch) =>
        dispatch({ type: "UPDATE_CUPBOARD_CUSTOMISATION", payload: { cupboardId: selectedCupboardId, patch } }),
      resetCupboardCustomisation: (cupboardId) =>
        dispatch({ type: "RESET_CUPBOARD_CUSTOMISATION", payload: { cupboardId } }),
      resetSelectedCupboardCustomisation: () =>
        dispatch({ type: "RESET_CUPBOARD_CUSTOMISATION", payload: { cupboardId: selectedCupboardId } }),
      rotateSelectedCupboard: () => dispatch({ type: "ROTATE_SELECTED_CUPBOARD", payload: { roomBounds: bounds } }),
      deleteSelectedCupboard: () => dispatch({ type: "DELETE_SELECTED_CUPBOARD" }),
      loadProject: ({ cupboards, projectCustomisation: importedProjectCustomisation } = {}) =>
        dispatch({
          type: "LOAD_PROJECT",
          payload: {
            cupboards,
            projectCustomisation: importedProjectCustomisation,
          },
        }),
    }),
    [bounds, selectedCupboardId],
  );

  const value = useMemo(
    () => ({
      cupboards: state.cupboards,
      placementPreview: state.placementPreview,
      activeMove: state.activeMove,
      activeResize: state.activeResize,
      isPlacementActive: Boolean(state.placementPreview),
      isMoveActive: Boolean(state.activeMove),
      isResizeActive: Boolean(state.activeResize),
      selectedCupboardId,
      selectedCupboard,
      selectedCupboardResolvedCustomisation,
      selectedPricingLineItem,
      tableTopRuns,
      pricingSummary,
      projectCustomisation,
      inheritedCupboardCount,
      ...actions,
    }),
    [
      actions,
      inheritedCupboardCount,
      pricingSummary,
      projectCustomisation,
      selectedCupboard,
      selectedCupboardResolvedCustomisation,
      selectedPricingLineItem,
      state.activeMove,
      state.activeResize,
      state.cupboards,
      state.placementPreview,
      selectedCupboardId,
      tableTopRuns,
    ],
  );

  return <CupboardContext.Provider value={value}>{children}</CupboardContext.Provider>;
};

export const useCupboards = () => {
  const context = useContext(CupboardContext);

  if (!context) {
    throw new Error("useCupboards must be used within a CupboardProvider");
  }

  return context;
};
