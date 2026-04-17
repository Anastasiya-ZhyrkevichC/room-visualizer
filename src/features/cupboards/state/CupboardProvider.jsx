import React, { createContext, useContext, useMemo, useReducer } from "react";

import { useRoomScene } from "../../room/context/RoomSceneContext";
import { selectSelectedCupboard } from "../selectors";
import { cupboardReducer, initialCupboardState } from "./cupboardReducer";

const CupboardContext = createContext(null);

export const CupboardProvider = ({ children }) => {
  const { bounds } = useRoomScene();
  const [state, dispatch] = useReducer(cupboardReducer, initialCupboardState);

  const selectedCupboard = useMemo(() => selectSelectedCupboard(state), [state]);
  const actions = useMemo(
    () => ({
      startPlacementPreview: (catalogId) =>
        dispatch({ type: "START_PLACEMENT_PREVIEW", payload: { catalogId, roomBounds: bounds } }),
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
      stepSelectedCupboardWidth: (direction) =>
        dispatch({ type: "STEP_SELECTED_CUPBOARD_WIDTH", payload: { direction, roomBounds: bounds } }),
      decreaseSelectedCupboardWidth: () =>
        dispatch({ type: "STEP_SELECTED_CUPBOARD_WIDTH", payload: { direction: "previous", roomBounds: bounds } }),
      increaseSelectedCupboardWidth: () =>
        dispatch({ type: "STEP_SELECTED_CUPBOARD_WIDTH", payload: { direction: "next", roomBounds: bounds } }),
      rotateSelectedCupboard: () => dispatch({ type: "ROTATE_SELECTED_CUPBOARD", payload: { roomBounds: bounds } }),
      deleteSelectedCupboard: () => dispatch({ type: "DELETE_SELECTED_CUPBOARD" }),
    }),
    [bounds],
  );

  const value = useMemo(
    () => ({
      cupboards: state.cupboards,
      placementPreview: state.placementPreview,
      activeMove: state.activeMove,
      isPlacementActive: Boolean(state.placementPreview),
      isMoveActive: Boolean(state.activeMove),
      selectedCupboardId: state.selectedCupboardId,
      selectedCupboard,
      ...actions,
    }),
    [actions, selectedCupboard, state.activeMove, state.cupboards, state.placementPreview, state.selectedCupboardId],
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
