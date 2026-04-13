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
      selectedCupboardId: state.selectedCupboardId,
      selectedCupboard,
      addCupboard: (catalogId) => dispatch({ type: "ADD_CUPBOARD", payload: { catalogId, roomBounds: bounds } }),
      selectCupboard: (cupboardId) => dispatch({ type: "SELECT_CUPBOARD", payload: { cupboardId } }),
      clearSelection: () => dispatch({ type: "CLEAR_SELECTION" }),
      rotateSelectedCupboard: () => dispatch({ type: "ROTATE_SELECTED_CUPBOARD", payload: { roomBounds: bounds } }),
      deleteSelectedCupboard: () => dispatch({ type: "DELETE_SELECTED_CUPBOARD" }),
    }),
    [bounds, selectedCupboard, state.cupboards, state.selectedCupboardId],
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
