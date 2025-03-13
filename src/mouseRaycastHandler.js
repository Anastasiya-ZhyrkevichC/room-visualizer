const handleMouseMove = (event, raycaster, mouse, camera, roomBoxRef, setBoxPosition, raycastingEnabled, gl) => {
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

export default handleMouseMove;
