import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { Raycaster, Vector2 } from "three";

import { useCupboards } from "../../cupboards/state/CupboardProvider";
import { useRoomScene } from "../context/RoomSceneContext";
import { createRoomWallTargets, getWallIntersectionById, updateRaycasterFromPointerEvent } from "../lib/wallRaycast";

const CupboardResizeController = () => {
  const { activeResize, cancelCupboardResize, finishCupboardResize, isResizeActive, updateCupboardResize } =
    useCupboards();
  const { camera, gl } = useThree();
  const { bounds, roomPosition } = useRoomScene();
  const activeWallId = activeResize?.wall ?? null;

  useEffect(() => {
    if (!isResizeActive || !activeWallId) {
      return undefined;
    }

    const raycaster = new Raycaster();
    const pointer = new Vector2();
    const domElement = gl.domElement;
    const wallTargets = createRoomWallTargets(bounds, roomPosition);
    const invalidateResize = () => updateCupboardResize({ wall: null, point: null });

    const handlePointerMove = (event) => {
      if (!updateRaycasterFromPointerEvent({ camera, domElement, event, pointer, raycaster })) {
        invalidateResize();
        return;
      }

      const intersection = getWallIntersectionById({
        raycaster,
        roomPosition,
        wallId: activeWallId,
        wallTargets,
      });

      if (!intersection) {
        invalidateResize();
        return;
      }

      updateCupboardResize(intersection);
    };

    const handlePointerUp = () => finishCupboardResize();
    const handlePointerCancel = () => cancelCupboardResize();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        cancelCupboardResize();
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    activeWallId,
    bounds,
    camera,
    cancelCupboardResize,
    finishCupboardResize,
    gl,
    isResizeActive,
    roomPosition,
    updateCupboardResize,
  ]);

  return null;
};

export default CupboardResizeController;
