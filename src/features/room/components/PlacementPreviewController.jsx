import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { Plane, Raycaster, Vector2, Vector3 } from "three";

import { BACK_WALL_ID, LEFT_WALL_ID, RIGHT_WALL_ID } from "../../cupboards/model/placement";
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
    const domElement = gl.domElement;
    const backWallPlane = new Plane(new Vector3(0, 0, 1), -(roomPosition.z + bounds.back));
    const leftWallPlane = new Plane(new Vector3(1, 0, 0), -(roomPosition.x + bounds.left));
    const rightWallPlane = new Plane(new Vector3(1, 0, 0), -(roomPosition.x + bounds.right));
    const wallTargets = [
      {
        id: LEFT_WALL_ID,
        plane: leftWallPlane,
        isWithinBounds: (point) =>
          point.z >= bounds.back && point.z <= bounds.front && point.y >= bounds.floor && point.y <= bounds.ceiling,
      },
      {
        id: RIGHT_WALL_ID,
        plane: rightWallPlane,
        isWithinBounds: (point) =>
          point.z >= bounds.back && point.z <= bounds.front && point.y >= bounds.floor && point.y <= bounds.ceiling,
      },
      {
        id: BACK_WALL_ID,
        plane: backWallPlane,
        isWithinBounds: (point) =>
          point.x >= bounds.left && point.x <= bounds.right && point.y >= bounds.floor && point.y <= bounds.ceiling,
      },
    ];
    const invalidatePreview = () => updatePlacementPreview({ wall: null, point: null });
    const toLocalPoint = (point) => ({
      x: point.x - roomPosition.x,
      y: point.y - roomPosition.y,
      z: point.z - roomPosition.z,
    });

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

      let closestWallTarget = null;

      wallTargets.forEach((target) => {
        const intersectionPoint = raycaster.ray.intersectPlane(target.plane, new Vector3());

        if (!intersectionPoint) {
          return;
        }

        const localPoint = toLocalPoint(intersectionPoint);

        if (!target.isWithinBounds(localPoint)) {
          return;
        }

        const distance = raycaster.ray.origin.distanceTo(intersectionPoint);

        if (!closestWallTarget || distance < closestWallTarget.distance - 0.000001) {
          closestWallTarget = {
            wall: target.id,
            point: localPoint,
            distance,
          };
        }
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
  }, [
    bounds.back,
    bounds.ceiling,
    bounds.floor,
    bounds.front,
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
