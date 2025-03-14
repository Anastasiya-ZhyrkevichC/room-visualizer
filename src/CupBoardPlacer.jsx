import React, { useState, useEffect, useRef, useCallback, forwardRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";

import { applyRaycastIntersectionCallback } from "./mouseRaycastHandler";
import RoomRefStore from "./RoomRefStore";

import * as THREE from "three";
import { Vector3 } from "three";
import { SolidCupboard, OpacityCupboard } from "./CupBoard";

const boxWidth = 0.6;
const boxHeight = 0.6;
const boxDepth = 0.4;

class CupBoard {
  constructor(position, size = [boxWidth, boxHeight, boxDepth]) {
    this.position = position;
    this.size = size;
  }
}

const BoxPlacer = ({ raycastingEnabled, placeNewCupBoard }) => {
  const [boxes, setBoxes] = useState([]);

  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  const [currentCupboard, setCurrentCupboard] = useState(null);

  const setCupBoardPositionCallback = (intersectionPosition, boxHeight, boxDepth) => {
    const newPosition = intersectionPosition;
    // [TODO] Need to find the nearest wall

    const updatedCupboardPosition = new Vector3(newPosition.x, boxHeight / 2, boxDepth / 2);
    updatedCupboardPosition.sub(RoomRefStore.getRoomCenter());

    // Create a new instance with updated position
    const updatedCupboard = currentCupboard
      ? new CupBoard(updatedCupboardPosition, currentCupboard.size)
      : new CupBoard(updatedCupboardPosition);

    // Update state correctly
    setCurrentCupboard(updatedCupboard);
  };

  const onMouseMoveFloor = useCallback(
    (event) =>
      applyRaycastIntersectionCallback(
        event,
        raycaster.current,
        mouse.current,
        camera,
        RoomRefStore.getFloor(),
        (intersectionPosition) => setCupBoardPositionCallback(intersectionPosition, boxHeight, boxDepth),
        gl,
      ),
    [camera, gl, boxHeight, boxDepth],
  );

  const onMouseClickFloor = useCallback(
    (event) => {
      console.log("I got clicked");

      setBoxes([...boxes, currentCupboard]);
      setCurrentCupboard(null);

      placeNewCupBoard();
    },
    [boxes, setBoxes, currentCupboard, setCurrentCupboard, placeNewCupBoard],
  );

  // Enable/disable mousemove event listener
  useEffect(() => {
    if (raycastingEnabled) {
      gl.domElement.addEventListener("mousemove", onMouseMoveFloor);
      gl.domElement.addEventListener("click", onMouseClickFloor);
    } else {
      gl.domElement.removeEventListener("mousemove", onMouseMoveFloor);
      gl.domElement.removeEventListener("click", onMouseClickFloor);
      setCurrentCupboard(null);
    }
    return () => {
      gl.domElement.removeEventListener("mousemove", onMouseMoveFloor);
      gl.domElement.removeEventListener("click", onMouseClickFloor);
    };
  }, [raycastingEnabled, gl.domElement, onMouseMoveFloor, onMouseClickFloor]);

  console.log(boxes);

  return (
    <>
      {currentCupboard && (
        <OpacityCupboard position={currentCupboard.position} size={[boxWidth, boxHeight, boxDepth]} />
      )}

      {boxes.map((box, index) => (
        <SolidCupboard key={index} position={box.position} size={box.size} />
      ))}
    </>
  );
};

export default BoxPlacer;
