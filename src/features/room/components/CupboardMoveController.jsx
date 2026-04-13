import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { Raycaster, Vector2 } from "three";

import { useCupboards } from "../../cupboards/state/CupboardProvider";
import { useRoomScene } from "../context/RoomSceneContext";
import { createRoomWallTargets, getWallIntersectionById, updateRaycasterFromPointerEvent } from "../lib/wallRaycast";

const CupboardMoveController = () => {
  const { activeMove, cancelCupboardMove, finishCupboardMove, isMoveActive, updateCupboardMove } = useCupboards();
  const { camera, gl } = useThree();
  const { bounds, roomPosition } = useRoomScene();
  const activeWallId = activeMove?.wall ?? null;

  useEffect(() => {
    if (!isMoveActive || !activeWallId) {
      return undefined;
    }

    const raycaster = new Raycaster();
    const pointer = new Vector2();
    const domElement = gl.domElement;
    const wallTargets = createRoomWallTargets(bounds, roomPosition);
    const invalidateMove = () => updateCupboardMove({ wall: null, point: null });

    const handlePointerMove = (event) => {
      if (!updateRaycasterFromPointerEvent({ camera, domElement, event, pointer, raycaster })) {
        invalidateMove();
        return;
      }

      const intersection = getWallIntersectionById({
        raycaster,
        roomPosition,
        wallId: activeWallId,
        wallTargets,
      });

      if (!intersection) {
        invalidateMove();
        return;
      }

      updateCupboardMove(intersection);
    };

    const handlePointerUp = () => finishCupboardMove();
    const handlePointerCancel = () => cancelCupboardMove();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        cancelCupboardMove();
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
    cancelCupboardMove,
    finishCupboardMove,
    gl,
    isMoveActive,
    roomPosition,
    updateCupboardMove,
  ]);

  return null;
};

export default CupboardMoveController;
