import React, { forwardRef } from "react";

const RoomBox = forwardRef(({ position, size, children }, ref) => {
  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="lightgray" transparent opacity={0.3} depthWrite={false} />
      {children}
    </mesh>
  );
});

export default RoomBox;
