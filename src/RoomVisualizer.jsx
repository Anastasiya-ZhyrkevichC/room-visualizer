import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Button } from '@mui/material';

const RoomVisualizer = () => {
  // State to manage the room dimensions
  const [length, setLength] = useState(5000); // in mm
  const [width, setWidth] = useState(4000); // in mm
  const [height, setHeight] = useState(3000); // in mm
  const [drawRoom, setDrawRoom] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'length') setLength(value);
    else if (name === 'width') setWidth(value);
    else if (name === 'height') setHeight(value);
  };

  // Handle the button click (done)
  const handleDone = () => {
    setDrawRoom(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
      <h1>Room Visualizer</h1>

      {/* Input Fields for Length, Width, and Height */}
      <div>
        <label>
          Length (mm):
          <input
            type="number"
            name="length"
            value={length}
            onChange={handleChange}
            style={{ margin: '10px' }}
          />
        </label>
        <br />
        <label>
          Width (mm):
          <input
            type="number"
            name="width"
            value={width}
            onChange={handleChange}
            style={{ margin: '10px' }}
          />
        </label>
        <br />
        <label>
          Height (mm):
          <input
            type="number"
            name="height"
            value={height}
            onChange={handleChange}
            style={{ margin: '10px' }}
          />
        </label>
        <br />
        <Button variant="contained" color="primary" onClick={handleDone}>
          Done
        </Button>
      </div>

      {/* Canvas to draw the room using Three.js */}
      {drawRoom && (
        <Canvas style={{ width: '600px', height: '400px', marginTop: '20px' }}>
          {/* The 3D Room */}
          <Room length={length} width={width} height={height} />
        </Canvas>
      )}
    </div>
  );
};

const Room = ({ length, width, height }) => {
  return (
    <>
      {/* Floor */}
      <mesh position={[0, -height / 2, 0]}>
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

export default RoomVisualizer;
