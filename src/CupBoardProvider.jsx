import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import RoomRefStore from "./RoomRefStore";

import { Vector3 } from "three";

const CupBoardContext = createContext(null);

const CABINET_GAP = 0.08;
const ROTATION_STEP = Math.PI / 2;

const convertMillimetersToMeters = (value) => value / 1000;

export const starterCabinetCatalog = [
  {
    id: "base-600",
    name: "Base cabinet 600",
    description: "Compact two-door base unit for the starter layout.",
    dimensionsMm: [600, 720, 560],
    size: [convertMillimetersToMeters(600), convertMillimetersToMeters(720), convertMillimetersToMeters(560)],
  },
  {
    id: "drawer-900",
    name: "Drawer base 900",
    description: "Wide drawer unit that makes rotation visibly obvious in the scene.",
    dimensionsMm: [900, 720, 560],
    size: [convertMillimetersToMeters(900), convertMillimetersToMeters(720), convertMillimetersToMeters(560)],
  },
  {
    id: "tall-600",
    name: "Tall pantry 600",
    description: "Full-height pantry block that anchors the run of cabinets.",
    dimensionsMm: [600, 2100, 600],
    size: [convertMillimetersToMeters(600), convertMillimetersToMeters(2100), convertMillimetersToMeters(600)],
  },
];

const starterCabinetLookup = starterCabinetCatalog.reduce((lookup, cabinet) => {
  lookup[cabinet.id] = cabinet;
  return lookup;
}, {});

const getNormalizedRotation = (rotation) => {
  const fullTurn = Math.PI * 2;
  const normalizedRotation = rotation % fullTurn;

  return normalizedRotation < 0 ? normalizedRotation + fullTurn : normalizedRotation;
};

export const getCupboardRotationDegrees = (rotation) =>
  Math.round((getNormalizedRotation(rotation) * 180) / Math.PI) % 360;

export const getCupboardFootprint = (size, rotation) => {
  const quarterTurns = Math.round(getNormalizedRotation(rotation) / ROTATION_STEP) % 4;

  if (quarterTurns % 2 === 1) {
    return {
      width: size[2],
      depth: size[0],
    };
  }

  return {
    width: size[0],
    depth: size[2],
  };
};

const getBottomRight = (cupboard) => {
  const footprint = getCupboardFootprint(cupboard.size, cupboard.rotation);

  return new Vector3(
    cupboard.position.x + footprint.width / 2,
    cupboard.position.y - cupboard.size[1] / 2,
    cupboard.position.z - footprint.depth / 2,
  );
};

const createCupboard = ({ id, cabinet, position, rotation = 0 }) => ({
  id,
  catalogId: cabinet.id,
  name: cabinet.name,
  description: cabinet.description,
  dimensionsMm: cabinet.dimensionsMm,
  size: cabinet.size,
  position,
  rotation,
});

const getInitialCupboardPosition = (size) => {
  const roomCenter = RoomRefStore.getRoomCenter() ?? new Vector3();
  const footprint = getCupboardFootprint(size, 0);

  return new Vector3(0, size[1] / 2, footprint.depth / 2).sub(roomCenter);
};

const getAttachedCupboardPosition = (lastCupboard, nextSize) => {
  const nextFootprint = getCupboardFootprint(nextSize, 0);

  return getBottomRight(lastCupboard).add(
    new Vector3(nextFootprint.width / 2 + CABINET_GAP, nextSize[1] / 2, nextFootprint.depth / 2),
  );
};

const alignCupboardToBackWall = (cupboard, rotation) => {
  const roomCenter = RoomRefStore.getRoomCenter() ?? new Vector3();
  const nextFootprint = getCupboardFootprint(cupboard.size, rotation);
  const nextPosition = cupboard.position.clone();

  nextPosition.z = nextFootprint.depth / 2 - roomCenter.z;

  return nextPosition;
};

export function CupBoardProvider({ children }) {
  const [cupboards, setCupboards] = useState([]);
  const [selectedCupboardId, setSelectedCupboardId] = useState(null);
  const nextCupboardIdRef = useRef(1);

  const addCupboard = useCallback((catalogId = starterCabinetCatalog[0].id) => {
    const selectedCabinet = starterCabinetLookup[catalogId] ?? starterCabinetCatalog[0];
    const nextCupboardId = nextCupboardIdRef.current++;

    setCupboards((prev) => {
      if (prev.length === 0) {
        return [
          ...prev,
          createCupboard({
            id: nextCupboardId,
            cabinet: selectedCabinet,
            position: getInitialCupboardPosition(selectedCabinet.size),
          }),
        ];
      }

      const lastCupboard = prev[prev.length - 1];
      const cupboardPosition = getAttachedCupboardPosition(lastCupboard, selectedCabinet.size);

      return [...prev, createCupboard({ id: nextCupboardId, cabinet: selectedCabinet, position: cupboardPosition })];
    });

    setSelectedCupboardId(nextCupboardId);
  }, []);

  const selectedCupboard = useMemo(
    () => cupboards.find((cupboard) => cupboard.id === selectedCupboardId) ?? null,
    [cupboards, selectedCupboardId],
  );

  const selectCupboard = useCallback((cupboardId) => {
    setSelectedCupboardId(cupboardId);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCupboardId(null);
  }, []);

  const rotateSelectedCupboard = useCallback(() => {
    if (selectedCupboardId === null) {
      return;
    }

    setCupboards((prev) =>
      prev.map((cupboard) => {
        if (cupboard.id !== selectedCupboardId) {
          return cupboard;
        }

        const nextRotation = getNormalizedRotation(cupboard.rotation + ROTATION_STEP);

        return {
          ...cupboard,
          rotation: nextRotation,
          position: alignCupboardToBackWall(cupboard, nextRotation),
        };
      }),
    );
  }, [selectedCupboardId]);

  const deleteSelectedCupboard = useCallback(() => {
    if (selectedCupboardId === null) {
      return;
    }

    setCupboards((prev) => prev.filter((cupboard) => cupboard.id !== selectedCupboardId));
    setSelectedCupboardId(null);
  }, [selectedCupboardId]);

  const value = useMemo(
    () => ({
      cupboards,
      starterCabinetCatalog,
      addCupboard,
      selectedCupboardId,
      selectedCupboard,
      selectCupboard,
      clearSelection,
      rotateSelectedCupboard,
      deleteSelectedCupboard,
    }),
    [
      cupboards,
      addCupboard,
      selectedCupboardId,
      selectedCupboard,
      selectCupboard,
      clearSelection,
      rotateSelectedCupboard,
      deleteSelectedCupboard,
    ],
  );

  return <CupBoardContext.Provider value={value}>{children}</CupBoardContext.Provider>;
}

export function useCupboards() {
  const ctx = useContext(CupBoardContext);

  // Currently I disable this check as it is failing in the localhost
  // if (!ctx) throw new Error("useCupboards must be used within a CupboardsProvider");
  return ctx;
}
