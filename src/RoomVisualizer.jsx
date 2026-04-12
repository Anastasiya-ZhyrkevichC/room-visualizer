import React, { useState } from "react";
import { Button } from "@mui/material";

import RotatingCubeWrapper from "./RotatingCubeWrapper";
import { useCupboards } from "./CupBoardProvider";

const defaultRoomDimensions = {
  length: 5000,
  width: 4000,
  height: 3000,
};

const roomFields = [
  { name: "length", label: "Length (mm)" },
  { name: "width", label: "Width (mm)" },
  { name: "height", label: "Height (mm)" },
];

const quickAddOptions = [
  { id: 1, name: "Add starter box" },
  { id: 2, name: "Add tall box" },
  { id: 3, name: "Add wall box" },
];

const toSceneValue = (value, fallback) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return fallback;
  }

  return numericValue / 1000;
};

const RoomVisualizer = () => {
  const [draftRoomDimensions, setDraftRoomDimensions] = useState(defaultRoomDimensions);
  const [sceneRoomDimensions, setSceneRoomDimensions] = useState(defaultRoomDimensions);
  const { addCupboard, cupboards } = useCupboards();

  const handleRoomChange = (event) => {
    const { name, value } = event.target;

    setDraftRoomDimensions((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  };

  const handleRefreshRoom = () => {
    setSceneRoomDimensions(draftRoomDimensions);
  };

  const sceneLength = toSceneValue(sceneRoomDimensions.length, defaultRoomDimensions.length / 1000);
  const sceneWidth = toSceneValue(sceneRoomDimensions.width, defaultRoomDimensions.width / 1000);
  const sceneHeight = toSceneValue(sceneRoomDimensions.height, defaultRoomDimensions.height / 1000);

  return (
    <div className="planner-page">
      <header className="planner-header">
        <div>
          <p className="planner-header__eyebrow">Kitchen Planner Prototype</p>
          <h1 className="planner-header__title">Shape the room before placing cabinets.</h1>
          <p className="planner-header__copy">
            Step 1 establishes the workspace: controls on the left, the 3D room in the center, and future detail panels
            on the right.
          </p>
        </div>
        <div className="planner-header__stats" aria-label="Planner overview">
          <div className="planner-stat">
            <span className="planner-stat__label">Room shell</span>
            <strong className="planner-stat__value">
              {sceneRoomDimensions.length} x {sceneRoomDimensions.width} x {sceneRoomDimensions.height} mm
            </strong>
          </div>
          <div className="planner-stat">
            <span className="planner-stat__label">Placed modules</span>
            <strong className="planner-stat__value">{cupboards.length}</strong>
          </div>
        </div>
      </header>

      <div className="planner-layout">
        <aside className="planner-panel planner-panel--left">
          <section className="panel-card">
            <div className="panel-card__header">
              <p className="panel-card__eyebrow">Left Panel</p>
              <h2 className="panel-card__title">Room controls</h2>
            </div>
            <p className="panel-card__copy">
              Keep the core dimensions editable here while the rest of the planner grows around this structure.
            </p>

            <div className="room-form">
              {roomFields.map((field) => (
                <label key={field.name} className="room-form__field">
                  <span>{field.label}</span>
                  <input
                    type="number"
                    name={field.name}
                    value={draftRoomDimensions[field.name]}
                    onChange={handleRoomChange}
                  />
                </label>
              ))}
            </div>

            <Button variant="contained" onClick={handleRefreshRoom} className="planner-button planner-button--primary">
              Refresh room view
            </Button>
          </section>

          <section className="panel-card panel-card--secondary">
            <div className="panel-card__header">
              <p className="panel-card__eyebrow">Prototype Actions</p>
              <h2 className="panel-card__title">Quick add</h2>
            </div>
            <p className="panel-card__copy">
              These temporary actions keep the cupboard renderer reachable until the catalog work lands in Step 3.
            </p>

            <div className="quick-actions">
              {quickAddOptions.map((option) => (
                <Button
                  key={option.id}
                  variant="outlined"
                  onClick={() => addCupboard()}
                  className="planner-button planner-button--secondary"
                >
                  {option.name}
                </Button>
              ))}
            </div>
          </section>
        </aside>

        <main className="planner-stage">
          <div className="planner-stage__header">
            <div>
              <p className="planner-stage__eyebrow">Main Workspace</p>
              <h2 className="planner-stage__title">3D room preview</h2>
            </div>
            <div className="planner-stage__badge">Center view stays dominant</div>
          </div>

          <div className="planner-stage__canvas">
            <RotatingCubeWrapper length={sceneLength} width={sceneWidth} height={sceneHeight} />
          </div>
        </main>

        <aside className="planner-panel planner-panel--right">
          <section className="panel-card">
            <div className="panel-card__header">
              <p className="panel-card__eyebrow">Right Panel</p>
              <h2 className="panel-card__title">Selected cabinet</h2>
            </div>

            <div className="empty-state">
              <strong className="empty-state__title">Nothing selected yet</strong>
              <p className="empty-state__copy">
                Cabinet details, rotation, delete actions, and other object tools will appear here in later steps.
              </p>
            </div>
          </section>

          <section className="panel-card panel-card--secondary">
            <div className="panel-card__header">
              <p className="panel-card__eyebrow">Planner Summary</p>
              <h2 className="panel-card__title">Reserved blocks</h2>
            </div>

            <div className="summary-list">
              <div className="summary-list__item">
                <span>Room dimensions</span>
                <strong>
                  {sceneRoomDimensions.length} / {sceneRoomDimensions.width} / {sceneRoomDimensions.height} mm
                </strong>
              </div>
              <div className="summary-list__item">
                <span>Modules in scene</span>
                <strong>{cupboards.length}</strong>
              </div>
            </div>

            <div className="empty-state empty-state--compact">
              Pricing, cabinet summaries, and project notes will live in this panel once those features are added.
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default RoomVisualizer;
