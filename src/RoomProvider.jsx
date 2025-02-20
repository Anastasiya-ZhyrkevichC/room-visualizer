import React, { createContext, useContext } from 'react';

// Create a RoomContext to store room parameters
const RoomContext = createContext();

export const useRoom = () => {
  return useContext(RoomContext);
};

export const RoomProvider = ({ children, length, width, height }) => {
    const X = - length / 2;
    const Y = 0;
    const Z = 0;

  return (
    <RoomContext.Provider value={{ X, Y, Z }}>
      {children}
    </RoomContext.Provider>
  );
};

export const PositionAdjuster = ({ children }) => {
  const { X, Y, Z } = useRoom();

  // Recursively adjust position for nested children
  const adjustPositionRecursively = (child) => {
    if (React.isValidElement(child)) {
      // If the child accepts the 'position' prop, adjust it
      if (child.props.position) {
        return React.cloneElement(child, {
          position: [
            child.props.position[0] + X,
            child.props.position[1] + Y,
            child.props.position[2] + Z,
          ]
        });
      }
      // If the child has children itself, apply recursively
      if (child.props.children) {
        return React.cloneElement(child, {
          children: React.Children.map(child.props.children, adjustPositionRecursively)
        });
      }
    }
    return child;
  };

  // Apply adjustment to each child element
  return (
    <>
      {React.Children.map(children, adjustPositionRecursively)}
    </>
  );
};
