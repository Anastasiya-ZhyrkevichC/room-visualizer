import React from "react";

import { useCupboards } from "../state/CupboardProvider";

const TABLE_TOP_COLOR = "#d8c3a5";

const toPositionProp = (position) => [position.x, position.y, position.z];

const TableTopRenderer = () => {
  const { tableTopRuns = [] } = useCupboards();

  return (
    <>
      {tableTopRuns.map((run) => (
        <mesh
          key={run.id}
          castShadow
          receiveShadow
          position={toPositionProp(run.position)}
          raycast={() => null}
        >
          <boxGeometry args={run.size} />
          <meshStandardMaterial color={TABLE_TOP_COLOR} metalness={0.08} roughness={0.62} />
        </mesh>
      ))}
    </>
  );
};

export default TableTopRenderer;
