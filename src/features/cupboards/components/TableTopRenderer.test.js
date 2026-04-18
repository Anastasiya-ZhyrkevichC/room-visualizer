import React from "react";

import TableTopRenderer from "./TableTopRenderer";
import { useCupboards } from "../state/CupboardProvider";

jest.mock("../state/CupboardProvider", () => ({
  useCupboards: jest.fn(),
}));

const createTableTopRunFixture = ({
  id,
  position = { x: 0, y: -0.76, z: -1.69 },
  size = [0.6, 0.04, 0.62],
} = {}) => ({
  id,
  position,
  size,
});

const getRenderedMeshes = () => React.Children.toArray(TableTopRenderer().props.children);

describe("TableTopRenderer", () => {
  it("renders one non-interactive mesh per derived tabletop run", () => {
    useCupboards.mockReturnValue({
      tableTopRuns: [
        createTableTopRunFixture({ id: "table-top-back-1" }),
        createTableTopRunFixture({
          id: "table-top-left-4",
          position: { x: -1.69, y: -0.76, z: 0.3 },
          size: [0.62, 0.04, 0.6],
        }),
      ],
    });

    const [firstMesh, secondMesh] = getRenderedMeshes();
    const firstMeshChildren = React.Children.toArray(firstMesh.props.children);

    expect(firstMesh.type).toBe("mesh");
    expect(firstMesh.props.position).toEqual([0, -0.76, -1.69]);
    expect(firstMesh.props.castShadow).toBe(true);
    expect(firstMesh.props.receiveShadow).toBe(true);
    expect(typeof firstMesh.props.raycast).toBe("function");
    expect(firstMeshChildren[0].type).toBe("boxGeometry");
    expect(firstMeshChildren[0].props.args).toEqual([0.6, 0.04, 0.62]);
    expect(firstMeshChildren[1].type).toBe("meshStandardMaterial");
    expect(firstMeshChildren[1].props).toMatchObject({
      color: "#d8c3a5",
      metalness: 0.08,
      roughness: 0.62,
    });

    expect(secondMesh.props.position).toEqual([-1.69, -0.76, 0.3]);
  });

  it("renders nothing when there are no tabletop runs", () => {
    useCupboards.mockReturnValue({
      tableTopRuns: [],
    });

    expect(getRenderedMeshes()).toEqual([]);
  });
});
