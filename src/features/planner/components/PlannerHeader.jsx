import React from "react";

import { useCupboards } from "../../cupboards/state/CupboardProvider";
import { formatRoomDimensions } from "../lib/roomFormatting";

const PlannerHeader = ({ appliedRoomDimensions }) => {
  const { selectedCupboard } = useCupboards();

  return (
    <header className="planner-header">
      <div>
        <p className="planner-header__eyebrow">Kitchen Planner Prototype · Step 4</p>
        <h1 className="planner-header__title">Choose defaults, place cabinets, then customise exceptions.</h1>
        <p className="planner-header__copy">
          Keep the room dimensions stable, set project-wide finishes above, drag starter cabinets into the room, and
          click a placed module in the scene to fine-tune it from the inspector on the right.
        </p>
      </div>
      <div className="planner-header__stats" aria-label="Planner overview">
        <div className="planner-stat">
          <span className="planner-stat__label">Room shell in scene</span>
          <strong className="planner-stat__value">{formatRoomDimensions(appliedRoomDimensions)}</strong>
        </div>
        <div className="planner-stat">
          <span className="planner-stat__label">Current selection</span>
          <strong className="planner-stat__value">{selectedCupboard ? selectedCupboard.name : "None yet"}</strong>
        </div>
      </div>
    </header>
  );
};

export default PlannerHeader;
