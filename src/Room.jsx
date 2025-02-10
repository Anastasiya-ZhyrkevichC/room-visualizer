
const Room = ({ length, width, height }) => {
    return (
      <>
        {/* Floor */}
        <mesh position={[0, -height / 2 / 1000, 0]}>
          <planeGeometry args={[width / 1000, length / 1000]} />
          <meshStandardMaterial color="lightgray" />
        </mesh>

        {/* Left Wall */}
        <mesh position={[-width / 2 / 1000, height / 2 / 1000, 0]}>
          <planeGeometry args={[height / 1000, length / 1000]} />
          <meshStandardMaterial color="lightblue" />
        </mesh>

        {/* Right Wall */}
        <mesh position={[width / 2 / 1000, height / 2 / 1000, 0]}>
          <planeGeometry args={[height / 1000, length / 1000]} />
          <meshStandardMaterial color="lightblue" />
        </mesh>

        {/* Center Wall */}
        <mesh position={[0, height / 2 / 1000, 0]}>
          <planeGeometry args={[height / 1000, length / 1000]} />
          <meshStandardMaterial color="gray" />
        </mesh>

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
      </>
    );
  };

export default Room;
