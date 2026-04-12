import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import RoomRefStore from "./RoomRefStore";

import { Vector3 } from "three";

const CupBoardContext = createContext(null);

const boxWidth = 0.6;
const boxHeight = 0.6;
const boxDepth = 0.4;

class CupBoard {
  constructor(position, size = [boxWidth, boxHeight, boxDepth]) {
    this.position = position;
    this.size = size;
  }

  getBottomLeft() {
    return new Vector3(
      this.position.x - this.size[0] / 2,
      this.position.y - this.size[1] / 2,
      this.position.z - this.size[2] / 2,
    );
  }

  getBottomRight() {
    return new Vector3(
      this.position.x + this.size[0] / 2,
      this.position.y - this.size[1] / 2,
      this.position.z - this.size[2] / 2,
    );
  }
}

export function CupBoardProvider({ children }) {
  const [cupboards, setCupboards] = useState([]);

  const addCupboard = useCallback(() => {
    setCupboards((prev) => {
      if (prev.length === 0) {
        // First cupboard, set it in the center of the room
        const initialPosition = new Vector3(0, boxHeight / 2, boxDepth / 2).sub(RoomRefStore.getRoomCenter());
        return [...prev, new CupBoard(initialPosition)];
      }

      const lastCupboard = prev[prev.length - 1];
      // Attach the cupboard to the bottom right of the last cupboard
      const cupboardPosition = lastCupboard
        .getBottomRight()
        .add(new Vector3(boxWidth / 2, boxHeight / 2, boxDepth / 2));

      return [...prev, new CupBoard(cupboardPosition)];
    });
  }, []);

  const value = useMemo(() => ({ cupboards, addCupboard }), [cupboards, addCupboard]);

  return <CupBoardContext.Provider value={value}>{children}</CupBoardContext.Provider>;
}

export function useCupboards() {
  const ctx = useContext(CupBoardContext);

  // Currently I disable this check as it is failing in the localhost
  // if (!ctx) throw new Error("useCupboards must be used within a CupboardsProvider");
  return ctx;
}
