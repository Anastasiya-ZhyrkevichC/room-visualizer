import { useEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

const createTickGeometry = (axis, offset) => {
  switch (axis) {
    case "x":
      return [new THREE.Vector3(offset, 0, 0), new THREE.Vector3(offset, 0.1, 0)];
    case "y":
      return [new THREE.Vector3(0, offset, 0), new THREE.Vector3(0.1, offset, 0)];
    default:
      return [new THREE.Vector3(0, 0, offset), new THREE.Vector3(0, 0.1, offset)];
  }
};

const createTicks = (axis, length = 10, step = 1) => {
  const ticks = [];

  for (let offset = -length; offset <= length; offset += step) {
    const [start, end] = createTickGeometry(axis, offset);

    ticks.push(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([start, end]),
        new THREE.LineBasicMaterial({ color: 0x000000 }),
      ),
    );
  }

  return ticks;
};

const SceneAxes = () => {
  const { scene } = useThree();

  useEffect(() => {
    const axesHelper = new THREE.AxesHelper(10);
    const tickLines = [...createTicks("x"), ...createTicks("y"), ...createTicks("z")];

    scene.add(axesHelper);
    tickLines.forEach((tickLine) => scene.add(tickLine));

    return () => {
      scene.remove(axesHelper);
      tickLines.forEach((tickLine) => {
        scene.remove(tickLine);
        tickLine.geometry.dispose();
        tickLine.material.dispose();
      });
    };
  }, [scene]);

  return null;
};

export default SceneAxes;
