import React from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

const AxesWithTicks = () => {
  // Function to create tick lines along axes
  const createTicks = (axis, length = 10, step = 1) => {
    const ticks = [];
    for (let i = -length; i <= length; i += step) {
      const tick = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          axis === "x" ? new THREE.Vector3(i, 0, 0) : new THREE.Vector3(0, i, 0),
          axis === "x" ? new THREE.Vector3(i, 0.1, 0) : new THREE.Vector3(0, i, 0.1),
        ]),
        new THREE.LineBasicMaterial({ color: 0x000000 }),
      );
      ticks.push(tick);
    }
    return ticks;
  };

  // Use the useThree hook to access the current scene, camera, etc.
  const { scene } = useThree();

  // Add the axis helper and ticks to the scene
  React.useEffect(() => {
    // Create the axes helper
    const axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper);

    // Create and add ticks for each axis
    createTicks("x").forEach((tick) => scene.add(tick));
    createTicks("y").forEach((tick) => scene.add(tick));
    createTicks("z").forEach((tick) => scene.add(tick));

    // Cleanup: remove the axes and ticks when the component unmounts
    return () => {
      scene.remove(axesHelper);
      createTicks("x").forEach((tick) => scene.remove(tick));
      createTicks("y").forEach((tick) => scene.remove(tick));
      createTicks("z").forEach((tick) => scene.remove(tick));
    };
  }, [scene]);

  return null; // This component doesn't render anything itself
};

export default AxesWithTicks;
