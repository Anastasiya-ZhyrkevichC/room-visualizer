import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Button } from '@mui/material';


import Room from './Room';
import RotatingCubeWrapper from './RotatingCubeWrapper';

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
      {!drawRoom && (
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
      )}
        <RotatingCubeWrapper/>
    </div>
  );
};





export default RoomVisualizer;
