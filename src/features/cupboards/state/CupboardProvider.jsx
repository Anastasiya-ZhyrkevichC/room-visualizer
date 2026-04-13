import React, { createContext, useContext, useMemo, useReducer } from "react";

import { useRoomScene } from "../../room/context/RoomSceneContext";
import { selectSelectedCupboard } from "../selectors";
import { cupboardReducer, initialCupboardState } from "./cupboardReducer";

const CupboardContext = createContext(null);

export const CupboardProvider = ({ children }) => {
  const { bounds } = useRoomScene();
  const [state, dispatch] = useReducer(cupboardReducer, initialCupboardState);

  const selectedCupboard = useMemo(() => selectSelectedCupboard(state), [state]);

  const value = useMemo(
    () => ({
      cupboards: state.cupboards,
      placementPreview: state.placementPreview,
      isPlacementActive: Boolean(state.placementPreview),
      selectedCupboardId: state.selectedCupboardId,
      selectedCupboard,
      addCupboard: (catalogId) => dispatch({ type: "ADD_CUPBOARD", payload: { catalogId, roomBounds: bounds } }),
      startPlacementPreview: (catalogId) =>
        dispatch({ type: "START_PLACEMENT_PREVIEW", payload: { catalogId, roomBounds: bounds } }),
      updatePlacementPreview: (placement) =>
        dispatch({ type: "UPDATE_PLACEMENT_PREVIEW", payload: { ...placement, roomBounds: bounds } }),
      finishPlacementPreview: () => dispatch({ type: "FINISH_PLACEMENT_PREVIEW" }),
      cancelPlacementPreview: () => dispatch({ type: "CANCEL_PLACEMENT_PREVIEW" }),
      selectCupboard: (cupboardId) => dispatch({ type: "SELECT_CUPBOARD", payload: { cupboardId } }),
      clearSelection: () => dispatch({ type: "CLEAR_SELECTION" }),
      rotateSelectedCupboard: () => dispatch({ type: "ROTATE_SELECTED_CUPBOARD", payload: { roomBounds: bounds } }),
      deleteSelectedCupboard: () => dispatch({ type: "DELETE_SELECTED_CUPBOARD" }),
    }),
    [bounds, selectedCupboard, state.cupboards, state.placementPreview, state.selectedCupboardId],
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
