import React from "react";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import { useCupboards } from "../../cupboards/state/CupboardProvider";
import { useRoomScene } from "../context/RoomSceneContext";
import PlacementPreviewController from "./PlacementPreviewController";
import RoomShell from "./RoomShell";
import SceneAxes from "./SceneAxes";

const RoomCanvas = () => {
  const { clearSelection, isPlacementActive } = useCupboards();
  const { dimensions } = useRoomScene();

  return (
    <div className="room-canvas-shell">
      <Canvas
        camera={{
          position: [0, Math.max(dimensions.height / 2, 1.6), Math.max(dimensions.width * 2.4, 4.5)],
          fov: 45,
        }}
        onPointerMissed={() => clearSelection()}
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[dimensions.length / 2, dimensions.height * 1.25, dimensions.width]}
          intensity={1}
        />

        <OrbitControls enabled={!isPlacementActive} />
        <PlacementPreviewController />
        <SceneAxes />
        <RoomShell />
      </Canvas>
    </div>
  );
};

export default RoomCanvas;
