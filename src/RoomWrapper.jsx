{
  /* Canvas to draw the room using Three.js */
}
{
  drawRoom && (
    <Canvas
      style={{
        width: "100vw", // Full width of the viewport
        height: "100vh", // Full height of the viewport
        margin: 0,
        padding: 0,
        position: "absolute", // To take the full screen
        top: 0,
        left: 0,
      }}
    >
      {/* The 3D Room */}
      <Room length={length} width={width} height={height} />
    </Canvas>
  );
}
