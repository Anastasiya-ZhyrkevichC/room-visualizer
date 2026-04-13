import React, { createContext, useContext, useMemo } from "react";

const RoomSceneContext = createContext(null);

const createRoomBounds = ({ length, width, height }) => ({
  left: -length / 2,
  right: length / 2,
  back: -width / 2,
  front: width / 2,
  floor: -height / 2,
  ceiling: height / 2,
});

export const RoomSceneProvider = ({ children, dimensions }) => {
  const bounds = useMemo(
    () => createRoomBounds(dimensions),
    [dimensions],
  );

  const value = useMemo(
    () => ({
      dimensions,
      bounds,
    }),
    [bounds, dimensions],
  );

  return <RoomSceneContext.Provider value={value}>{children}</RoomSceneContext.Provider>;
};

export const useRoomScene = () => {
  const context = useContext(RoomSceneContext);

  if (!context) {
    throw new Error("useRoomScene must be used within a RoomSceneProvider");
  }

  return context;
};
