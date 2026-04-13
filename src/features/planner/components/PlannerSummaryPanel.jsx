import React from "react";

import { useCupboards } from "../../cupboards/state/CupboardProvider";

const PlannerSummaryPanel = ({ appliedRoomDimensions }) => {
  const { cupboards, selectedCupboard } = useCupboards();

  return (
    <section className="panel-card panel-card--secondary">
      <div className="panel-card__header">
        <p className="panel-card__eyebrow">Planner Summary</p>
        <h2 className="panel-card__title">Scene snapshot</h2>
      </div>

      <div className="summary-list">
        <div className="summary-list__item">
          <span>Room dimensions</span>
          <strong>
            {appliedRoomDimensions.length} / {appliedRoomDimensions.width} / {appliedRoomDimensions.height} mm
          </strong>
        </div>
        <div className="summary-list__item">
          <span>Modules in scene</span>
          <strong>{cupboards.length}</strong>
        </div>
        <div className="summary-list__item">
          <span>Inspector state</span>
          <strong>{selectedCupboard ? "Cabinet selected" : "Waiting for selection"}</strong>
        </div>
      </div>

      <div className="empty-state empty-state--compact">
        Grouping, pricing totals, and project notes can build on this module data in the next steps.
      </div>
    </section>
  );
};

export default PlannerSummaryPanel;
