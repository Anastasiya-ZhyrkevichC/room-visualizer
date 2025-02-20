import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Button } from "@mui/material";

import Room from "./Room";
import RotatingCubeWrapper from "./RotatingCubeWrapper";

const RoomVisualizer = () => {
  // State to manage the room dimensions
  const [length, setLength] = useState(5000); // in mm
  const [width, setWidth] = useState(4000); // in mm
  const [height, setHeight] = useState(3000); // in mm
  const [drawRoom, setDrawRoom] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "length") setLength(value);
    else if (name === "width") setWidth(value);
    else if (name === "height") setHeight(value);
  };

  // Handle the button click (done)
  const handleDone = () => {
    setDrawRoom(true);
  };

  // Placeholder for different boxes
  const boxes = [
    { id: 1, name: "Box 1" },
    { id: 2, name: "Box 2" },
    { id: 3, name: "Box 3" },
  ];

  const [selectedBox, setSelectedBox] = useState(null);

  const handleBoxClick = (boxId) => {
    setSelectedBox(boxId);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        marginTop: "20px",
      }}
    >
      {/* Main content area */}
      <div style={{ flex: 1, textAlign: "center" }}>
        <h1>Room Visualizer</h1>

        {/* Input Fields for Length, Width, and Height */}
        {!drawRoom && (
          <div>
            <label>
              Length (mm):
              <input type="number" name="length" value={length} onChange={handleChange} style={{ margin: "10px" }} />
            </label>
            <br />
            <label>
              Width (mm):
              <input type="number" name="width" value={width} onChange={handleChange} style={{ margin: "10px" }} />
            </label>
            <br />
            <label>
              Height (mm):
              <input type="number" name="height" value={height} onChange={handleChange} style={{ margin: "10px" }} />
            </label>
            <br />
            <Button variant="contained" color="primary" onClick={handleDone}>
              Done
            </Button>
          </div>
        )}
        <RotatingCubeWrapper />
      </div>

      {/* Sidebar Panel with Buttons */}
      <div
        style={{
          width: "200px",
          padding: "20px",
          borderLeft: "1px solid #ccc",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <h3>Select a Box</h3>
        {boxes.map((box) => (
          <Button
            key={box.id}
            variant="contained"
            color="secondary"
            style={{ marginBottom: "10px" }}
            onClick={() => handleBoxClick(box.id)}
          >
            {box.name}
          </Button>
        ))}

        {/* Display the selected box */}
        {selectedBox && <div>Selected Box ID: {selectedBox}</div>}
      </div>
    </div>
  );
};

export default RoomVisualizer;
