import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { Plane, Raycaster, Vector2, Vector3 } from "three";

import { BACK_WALL_ID } from "../../cupboards/model/placement";
import { useCupboards } from "../../cupboards/state/CupboardProvider";
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
    const intersectionPoint = new Vector3();
    const domElement = gl.domElement;
    const backWallPlane = new Plane(new Vector3(0, 0, 1), -(roomPosition.z + bounds.back));
    const isWithinBackWallBounds = (point) =>
      point.x >= bounds.left && point.x <= bounds.right && point.y >= bounds.floor && point.y <= bounds.ceiling;
    const invalidatePreview = () => updatePlacementPreview({ wall: null, point: null });

    const handlePointerMove = (event) => {
      const rect = domElement.getBoundingClientRect();

      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
        invalidatePreview();
        return;
      }

      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);

      if (raycaster.ray.intersectPlane(backWallPlane, intersectionPoint)) {
        const localPoint = {
          x: intersectionPoint.x - roomPosition.x,
          y: intersectionPoint.y - roomPosition.y,
          z: intersectionPoint.z - roomPosition.z,
        };

        if (!isWithinBackWallBounds(localPoint)) {
          invalidatePreview();
          return;
        }

        updatePlacementPreview({
          wall: BACK_WALL_ID,
          point: localPoint,
        });
        return;
      }

      invalidatePreview();
    };

    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [
    bounds.back,
    bounds.ceiling,
    bounds.floor,
    bounds.left,
    bounds.right,
    camera,
    gl,
    isPlacementActive,
    roomPosition.x,
    roomPosition.y,
    roomPosition.z,
    updatePlacementPreview,
  ]);

  return null;
};

export default PlacementPreviewController;
