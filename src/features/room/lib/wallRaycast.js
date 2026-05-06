import { Plane, Vector3 } from "three";

import { BACK_WALL_ID, LEFT_WALL_ID, RIGHT_WALL_ID } from "../../cupboards/model/walls";

export const createRoomWallTargets = (bounds, roomPosition) => [
  {
    id: LEFT_WALL_ID,
    plane: new Plane(new Vector3(1, 0, 0), -(roomPosition.x + bounds.left)),
    isWithinBounds: (point) =>
      point.z >= bounds.back && point.z <= bounds.front && point.y >= bounds.floor && point.y <= bounds.ceiling,
  },
  {
    id: RIGHT_WALL_ID,
    plane: new Plane(new Vector3(1, 0, 0), -(roomPosition.x + bounds.right)),
    isWithinBounds: (point) =>
      point.z >= bounds.back && point.z <= bounds.front && point.y >= bounds.floor && point.y <= bounds.ceiling,
  },
  {
    id: BACK_WALL_ID,
    plane: new Plane(new Vector3(0, 0, 1), -(roomPosition.z + bounds.back)),
    isWithinBounds: (point) =>
      point.x >= bounds.left && point.x <= bounds.right && point.y >= bounds.floor && point.y <= bounds.ceiling,
  },
];

export const updateRaycasterFromPointerEvent = ({ camera, domElement, event, pointer, raycaster }) => {
  const rect = domElement.getBoundingClientRect();

  if (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  ) {
    return false;
  }

  pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);

  return true;
};

const toLocalRoomPoint = (point, roomPosition) => ({
  x: point.x - roomPosition.x,
  y: point.y - roomPosition.y,
  z: point.z - roomPosition.z,
});

const getFloorIntersectionPoint = ({ bounds, raycaster, roomPosition }) => {
  const floorPlane = new Plane(new Vector3(0, 1, 0), -(roomPosition.y + bounds.floor));
  const intersectionPoint = raycaster.ray.intersectPlane(floorPlane, new Vector3());

  if (!intersectionPoint) {
    return null;
  }

  return toLocalRoomPoint(intersectionPoint, roomPosition);
};

const projectFloorIntersectionToWall = ({ bounds, floorPoint, wallId }) => {
  switch (wallId) {
    case BACK_WALL_ID:
      return {
        wall: BACK_WALL_ID,
        point: {
          x: floorPoint.x,
          y: bounds.floor,
          z: bounds.back,
        },
      };
    case LEFT_WALL_ID:
      return {
        wall: LEFT_WALL_ID,
        point: {
          x: bounds.left,
          y: bounds.floor,
          z: floorPoint.z,
        },
      };
    case RIGHT_WALL_ID:
      return {
        wall: RIGHT_WALL_ID,
        point: {
          x: bounds.right,
          y: bounds.floor,
          z: floorPoint.z,
        },
      };
    default:
      return null;
  }
};

const getWallIntersection = ({ raycaster, roomPosition, wallTarget }) => {
  const intersectionPoint = raycaster.ray.intersectPlane(wallTarget.plane, new Vector3());

  if (!intersectionPoint) {
    return null;
  }

  const localPoint = toLocalRoomPoint(intersectionPoint, roomPosition);

  if (!wallTarget.isWithinBounds(localPoint)) {
    return null;
  }

  return {
    wall: wallTarget.id,
    point: localPoint,
    distance: raycaster.ray.origin.distanceTo(intersectionPoint),
  };
};

export const getClosestWallIntersection = ({ raycaster, roomPosition, wallTargets }) => {
  let closestWallTarget = null;

  wallTargets.forEach((wallTarget) => {
    const intersection = getWallIntersection({
      raycaster,
      roomPosition,
      wallTarget,
    });

    if (!intersection) {
      return;
    }

    if (!closestWallTarget || intersection.distance < closestWallTarget.distance - 0.000001) {
      closestWallTarget = intersection;
    }
  });

  return closestWallTarget;
};

export const getWallTargetById = (wallTargets, wallId) =>
  wallTargets.find((wallTarget) => wallTarget.id === wallId) ?? null;

export const getWallIntersectionById = ({ raycaster, roomPosition, wallId, wallTargets }) => {
  const wallTarget = getWallTargetById(wallTargets, wallId);

  if (!wallTarget) {
    return null;
  }

  return getWallIntersection({
    raycaster,
    roomPosition,
    wallTarget,
  });
};

export const getResizeWallIntersectionById = ({ bounds, raycaster, roomPosition, wallId, wallTargets }) => {
  const wallIntersection = getWallIntersectionById({
    raycaster,
    roomPosition,
    wallId,
    wallTargets,
  });

  if (wallIntersection) {
    return wallIntersection;
  }

  const floorPoint = getFloorIntersectionPoint({
    bounds,
    raycaster,
    roomPosition,
  });

  if (!floorPoint) {
    return null;
  }

  return projectFloorIntersectionToWall({
    bounds,
    floorPoint,
    wallId,
  });
};
