import { Ray, Vector3 } from "three";

import { BACK_WALL_ID, LEFT_WALL_ID, RIGHT_WALL_ID } from "../../cupboards/model/walls";
import { createRoomWallTargets, getResizeWallIntersectionById, getWallIntersectionById } from "./wallRaycast";

const bounds = {
  left: -2,
  right: 2,
  floor: -1.5,
  ceiling: 1.5,
  back: -2,
  front: 2,
};

const roomPosition = {
  x: 4,
  y: 3,
  z: -6,
};

const wallTargets = createRoomWallTargets(bounds, roomPosition);

const toWorldPoint = (localPoint) => ({
  x: roomPosition.x + localPoint.x,
  y: roomPosition.y + localPoint.y,
  z: roomPosition.z + localPoint.z,
});

const createRaycaster = ({ origin, target }) => ({
  ray: new Ray(
    new Vector3(origin.x, origin.y, origin.z),
    new Vector3(target.x - origin.x, target.y - origin.y, target.z - origin.z).normalize(),
  ),
});

const expectPointToMatch = (receivedPoint, expectedPoint) => {
  expect(receivedPoint.x).toBeCloseTo(expectedPoint.x);
  expect(receivedPoint.y).toBeCloseTo(expectedPoint.y);
  expect(receivedPoint.z).toBeCloseTo(expectedPoint.z);
};

describe("wall raycast resize intersections", () => {
  it("returns the direct active-wall hit unchanged when the wall is under the pointer", () => {
    const raycaster = createRaycaster({
      origin: toWorldPoint({ x: 0.6, y: 1.2, z: 3 }),
      target: toWorldPoint({ x: 0.4, y: 0.1, z: bounds.back }),
    });

    const wallIntersection = getWallIntersectionById({
      raycaster,
      roomPosition,
      wallId: BACK_WALL_ID,
      wallTargets,
    });
    const resizeIntersection = getResizeWallIntersectionById({
      bounds,
      raycaster,
      roomPosition,
      wallId: BACK_WALL_ID,
      wallTargets,
    });

    expect(wallIntersection).not.toBeNull();
    expect(resizeIntersection).toEqual(wallIntersection);
  });

  it("projects a floor hit back onto the back wall when the wall is missed during resize", () => {
    const raycaster = createRaycaster({
      origin: toWorldPoint({ x: 0.6, y: 2, z: 2.5 }),
      target: toWorldPoint({ x: 0.6, y: bounds.floor, z: 0.4 }),
    });

    expect(
      getWallIntersectionById({
        raycaster,
        roomPosition,
        wallId: BACK_WALL_ID,
        wallTargets,
      }),
    ).toBeNull();

    const intersection = getResizeWallIntersectionById({
      bounds,
      raycaster,
      roomPosition,
      wallId: BACK_WALL_ID,
      wallTargets,
    });

    expect(intersection).toMatchObject({
      wall: BACK_WALL_ID,
    });
    expectPointToMatch(intersection.point, {
      x: 0.6,
      y: bounds.floor,
      z: bounds.back,
    });
  });

  it("projects a floor hit back onto the left wall when the wall is missed during resize", () => {
    const raycaster = createRaycaster({
      origin: toWorldPoint({ x: 2.5, y: 2, z: 0.7 }),
      target: toWorldPoint({ x: -0.8, y: bounds.floor, z: 0.7 }),
    });

    expect(
      getWallIntersectionById({
        raycaster,
        roomPosition,
        wallId: LEFT_WALL_ID,
        wallTargets,
      }),
    ).toBeNull();

    const intersection = getResizeWallIntersectionById({
      bounds,
      raycaster,
      roomPosition,
      wallId: LEFT_WALL_ID,
      wallTargets,
    });

    expect(intersection).toMatchObject({
      wall: LEFT_WALL_ID,
    });
    expectPointToMatch(intersection.point, {
      x: bounds.left,
      y: bounds.floor,
      z: 0.7,
    });
  });

  it("projects a floor hit back onto the right wall when the wall is missed during resize", () => {
    const raycaster = createRaycaster({
      origin: toWorldPoint({ x: -2.5, y: 2, z: -0.4 }),
      target: toWorldPoint({ x: 0.8, y: bounds.floor, z: -0.4 }),
    });

    expect(
      getWallIntersectionById({
        raycaster,
        roomPosition,
        wallId: RIGHT_WALL_ID,
        wallTargets,
      }),
    ).toBeNull();

    const intersection = getResizeWallIntersectionById({
      bounds,
      raycaster,
      roomPosition,
      wallId: RIGHT_WALL_ID,
      wallTargets,
    });

    expect(intersection).toMatchObject({
      wall: RIGHT_WALL_ID,
    });
    expectPointToMatch(intersection.point, {
      x: bounds.right,
      y: bounds.floor,
      z: -0.4,
    });
  });

  it("returns null when both the active wall and the floor are unavailable", () => {
    const raycaster = createRaycaster({
      origin: toWorldPoint({ x: 0, y: 0, z: 0 }),
      target: toWorldPoint({ x: 1, y: 0, z: 0 }),
    });

    expect(
      getResizeWallIntersectionById({
        bounds,
        raycaster,
        roomPosition,
        wallId: BACK_WALL_ID,
        wallTargets,
      }),
    ).toBeNull();
  });
});
