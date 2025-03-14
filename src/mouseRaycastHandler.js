const handleMouseMoveInRoom = (event, raycaster, mouse, camera, roomBoxRef, setBoxPosition, raycastingEnabled, gl) => {
  if (!raycastingEnabled) {
    return;
  }
  // Convert screen coordinates to normalized device coordinates
  const rect = gl.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  // Raycast from camera
  raycaster.setFromCamera(mouse, camera);

  if (roomBoxRef.current) {
    const intersects = raycaster.intersectObject(roomBoxRef.current);
    if (intersects.length > 0) {
      setBoxPosition(intersects[0].point); // Set box at intersection point
    } else {
      setBoxPosition(null); // Hide box if no intersection
    }
  }
};

// Return local position of the intersection
const applyRaycastIntersectionCallback = (
  event,
  raycaster,
  mouse,
  camera,
  objectRef,
  intersectionPositionCallback,
  gl,
) => {
  const rect = gl.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  // Raycast from camera
  raycaster.setFromCamera(mouse, camera);

  if (objectRef.current) {
    const intersects = raycaster.intersectObject(objectRef.current);
    if (intersects.length > 0) {
      const intersection = intersects[0];

      const worldPosition = intersection.point.clone();

      // Convert to local coordinates
      const localPosition = intersection.object.worldToLocal(worldPosition.clone());
      intersectionPositionCallback(localPosition);
    }
  }
};

export { handleMouseMoveInRoom, applyRaycastIntersectionCallback };
