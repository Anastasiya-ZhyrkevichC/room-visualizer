import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { Raycaster, Vector2 } from "three";

import { useCupboards } from "../../cupboards/state/CupboardProvider";
import { createRoomWallTargets, getClosestWallIntersection, updateRaycasterFromPointerEvent } from "../lib/wallRaycast";
import { useRoomScene } from "../context/RoomSceneContext";

const PlacementPreviewController = () => {
  const { isPlacementActive, updatePlacementPreview } = useCupboards();
  const { camera, gl } = useThree();
  const { bounds, roomPosition } = useRoomScene();

  useEffect(() => {
    if (!isPlacementActive) {
      return undefined;
    }

    const raycaster = new Raycaster();
    const pointer = new Vector2();
    const domElement = gl.domElement;
    const wallTargets = createRoomWallTargets(bounds, roomPosition);
    const invalidatePreview = () => updatePlacementPreview({ wall: null, point: null });

    const handlePointerMove = (event) => {
      if (!updateRaycasterFromPointerEvent({ camera, domElement, event, pointer, raycaster })) {
        invalidatePreview();
        return;
      }

      const closestWallTarget = getClosestWallIntersection({
        raycaster,
        roomPosition,
        wallTargets,
      });

      if (closestWallTarget) {
        updatePlacementPreview({
          wall: closestWallTarget.wall,
          point: closestWallTarget.point,
        });
        return;
      }

      invalidatePreview();
    };

    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [bounds, camera, gl, isPlacementActive, roomPosition, updatePlacementPreview]);

  return null;
};

export default PlacementPreviewController;
