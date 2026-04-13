import React, { forwardRef } from "react";

const WallPlane = forwardRef(({ position, rotation, size }, ref) => {
  return (
    <mesh ref={ref} position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshStandardMaterial color="lightgray" />
    </mesh>
  );
});

export default WallPlane;
