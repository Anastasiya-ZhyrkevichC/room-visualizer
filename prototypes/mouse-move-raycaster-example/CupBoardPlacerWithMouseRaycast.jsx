import React, { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

import { GhostCupboardMesh, CupboardMesh } from "../../src/features/cupboards/components/CupboardMesh";
import { applyRaycastIntersectionCallback } from "./mouseRaycastHandler";

// Archived prototype kept outside src. It now depends on explicit room props instead of a singleton store.

const boxWidth = 0.6;
const boxHeight = 0.6;
const boxDepth = 0.4;

const BoxPlacerWithMouseRaycast = ({ raycastingEnabled, floorRef, roomBounds, onPlaceCupboard }) => {
  const [boxes, setBoxes] = useState([]);
  const [currentCupboard, setCurrentCupboard] = useState(null);
  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  const setCupboardPosition = useCallback(
    (intersectionPosition) => {
      setCurrentCupboard({
        position: {
          x: intersectionPosition.x,
          y: roomBounds.floor + boxHeight / 2,
          z: roomBounds.back + boxDepth / 2,
        },
        size: [boxWidth, boxHeight, boxDepth],
      });
    },
    [roomBounds.back, roomBounds.floor],
  );

  const onMouseMoveFloor = useCallback(
    (event) =>
      applyRaycastIntersectionCallback(
        event,
        raycaster.current,
        mouse.current,
        camera,
        floorRef,
        setCupboardPosition,
        gl,
      ),
    [camera, floorRef, gl, setCupboardPosition],
  );

  const onMouseClickFloor = useCallback(() => {
    if (!currentCupboard) {
      return;
    }

    setBoxes((previousBoxes) => [...previousBoxes, currentCupboard]);
    setCurrentCupboard(null);

    if (onPlaceCupboard) {
      onPlaceCupboard(currentCupboard);
    }
  }, [currentCupboard, onPlaceCupboard]);

  useEffect(() => {
    if (!raycastingEnabled) {
      setCurrentCupboard(null);
      return undefined;
    }

    gl.domElement.addEventListener("mousemove", onMouseMoveFloor);
    gl.domElement.addEventListener("click", onMouseClickFloor);

    return () => {
      gl.domElement.removeEventListener("mousemove", onMouseMoveFloor);
      gl.domElement.removeEventListener("click", onMouseClickFloor);
    };
  }, [gl, onMouseClickFloor, onMouseMoveFloor, raycastingEnabled]);

  return (
    <>
      {currentCupboard ? <GhostCupboardMesh position={currentCupboard.position} size={currentCupboard.size} /> : null}

      {boxes.map((box, index) => (
        <CupboardMesh key={index} position={box.position} size={box.size} />
      ))}
    </>
  );
};

export default BoxPlacerWithMouseRaycast;
