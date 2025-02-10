import React, { createContext, useContext } from 'react';

// Create a RoomContext to store room parameters
const RoomContext = createContext();

export const useRoom = () => {
  return useContext(RoomContext);
};

export const RoomProvider = ({ children, length, width, height }) => {
    const X = - length / 2;
    const Y = height / 2;
    const Z = width / 2;

  return (
    <RoomContext.Provider value={{ X, Y, Z }}>
      {children}
    </RoomContext.Provider>
  );
};
