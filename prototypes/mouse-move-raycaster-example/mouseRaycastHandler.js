// Archived helper from the mouse-placement prototype.

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

  raycaster.setFromCamera(mouse, camera);

  if (objectRef.current) {
    const intersects = raycaster.intersectObject(objectRef.current);
    if (intersects.length > 0) {
      const worldPosition = intersects[0].point.clone();
      const localPosition = intersects[0].object.worldToLocal(worldPosition.clone());

      intersectionPositionCallback(localPosition);
    }
  }
};

export { applyRaycastIntersectionCallback };
