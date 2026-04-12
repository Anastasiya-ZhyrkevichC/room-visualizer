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
  { name: "length", label: "Length", unit: "mm" },
  { name: "width", label: "Width", unit: "mm" },
  { name: "height", label: "Height", unit: "mm" },
];

const quickAddOptions = [
  { id: 1, name: "Add starter box" },
  { id: 2, name: "Add tall box" },
  { id: 3, name: "Add wall box" },
];

const createDraftRoomDimensions = (dimensions) =>
  roomFields.reduce((draft, field) => ({ ...draft, [field.name]: String(dimensions[field.name]) }), {});

const formatRoomDimensions = (dimensions) => `${dimensions.length} x ${dimensions.width} x ${dimensions.height} mm`;

const validateRoomDimensions = (dimensions) => {
  const errors = {};
  const parsedDimensions = {};

  roomFields.forEach((field) => {
    const rawValue = String(dimensions[field.name] ?? "").trim();

    if (rawValue === "") {
      errors[field.name] = `${field.label} is required.`;
      return;
    }

    const numericValue = Number(rawValue);

    if (!Number.isFinite(numericValue)) {
      errors[field.name] = `${field.label} must be a valid number.`;
      return;
    }

    if (numericValue === 0) {
      errors[field.name] = `${field.label} must be greater than 0 ${field.unit}.`;
      return;
    }

    if (numericValue < 0) {
      errors[field.name] = `${field.label} cannot be negative.`;
      return;
    }

    parsedDimensions[field.name] = numericValue;
  });

  return {
    errors,
    parsedDimensions,
    isValid: Object.keys(errors).length === 0,
  };
};

const RoomVisualizer = () => {
  const [draftRoomDimensions, setDraftRoomDimensions] = useState(() =>
    createDraftRoomDimensions(defaultRoomDimensions),
  );
  const [appliedRoomDimensions, setAppliedRoomDimensions] = useState(defaultRoomDimensions);
  const [validationErrors, setValidationErrors] = useState({});
  const [roomFeedback, setRoomFeedback] = useState(null);
  const [hasAttemptedApply, setHasAttemptedApply] = useState(false);
  const { addCupboard, cupboards } = useCupboards();

  const handleRoomChange = (event) => {
    const { name, value } = event.target;
    const nextDraftRoomDimensions = {
      ...draftRoomDimensions,
      [name]: value,
    };

    setDraftRoomDimensions(nextDraftRoomDimensions);

    if (hasAttemptedApply) {
      setValidationErrors(validateRoomDimensions(nextDraftRoomDimensions).errors);
    }

    if (roomFeedback) {
      setRoomFeedback(null);
    }
  };

  const handleApplyRoom = (event) => {
    event.preventDefault();
    setHasAttemptedApply(true);

    const { errors, parsedDimensions, isValid } = validateRoomDimensions(draftRoomDimensions);

    if (!isValid) {
      setValidationErrors(errors);
      setRoomFeedback({
        tone: "error",
        message: "Enter a positive value for each room dimension before applying changes.",
      });
      return;
    }

    setValidationErrors({});
    setHasAttemptedApply(false);
    setAppliedRoomDimensions(parsedDimensions);
    setDraftRoomDimensions(createDraftRoomDimensions(parsedDimensions));
    setRoomFeedback({
      tone: "success",
      message: `Room updated to ${formatRoomDimensions(parsedDimensions)}.`,
    });
  };

  const handleResetRoom = () => {
    setDraftRoomDimensions(createDraftRoomDimensions(defaultRoomDimensions));
    setAppliedRoomDimensions(defaultRoomDimensions);
    setValidationErrors({});
    setHasAttemptedApply(false);
    setRoomFeedback({
      tone: "info",
      message: `Room reset to default size: ${formatRoomDimensions(defaultRoomDimensions)}.`,
    });
  };

  const sceneLength = appliedRoomDimensions.length / 1000;
  const sceneWidth = appliedRoomDimensions.width / 1000;
  const sceneHeight = appliedRoomDimensions.height / 1000;
  const hasDraftChanges = roomFields.some(
    (field) => draftRoomDimensions[field.name] !== String(appliedRoomDimensions[field.name]),
  );
  const isDefaultRoomApplied = roomFields.every(
    (field) => appliedRoomDimensions[field.name] === defaultRoomDimensions[field.name],
  );

  return (
    <div className="planner-page">
      <header className="planner-header">
        <div>
          <p className="planner-header__eyebrow">Kitchen Planner Prototype · Step 2</p>
          <h1 className="planner-header__title">Confirm the room shell before placing cabinets.</h1>
          <p className="planner-header__copy">
            Set the core room size in millimeters, apply valid changes to update the 3D shell, and reset back to the
            default plan when needed.
          </p>
        </div>
        <div className="planner-header__stats" aria-label="Planner overview">
          <div className="planner-stat">
            <span className="planner-stat__label">Room shell in scene</span>
            <strong className="planner-stat__value">{formatRoomDimensions(appliedRoomDimensions)}</strong>
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
              <p className="panel-card__eyebrow">Room Setup</p>
              <h2 className="panel-card__title">Define room dimensions</h2>
            </div>
            <p className="panel-card__copy">
              The 3D room updates only after you apply valid dimensions, so temporary edits and validation problems
              never break the scene.
            </p>

            <form className="room-form" onSubmit={handleApplyRoom} noValidate>
              {roomFields.map((field) => (
                <label
                  key={field.name}
                  className={`room-form__field${validationErrors[field.name] ? " room-form__field--error" : ""}`}
                >
                  <span className="room-form__label">
                    <span>{field.label}</span>
                    <span className="room-form__unit">{field.unit}</span>
                  </span>
                  <input
                    type="number"
                    name={field.name}
                    min="1"
                    step="1"
                    value={draftRoomDimensions[field.name]}
                    onChange={handleRoomChange}
                    aria-invalid={Boolean(validationErrors[field.name])}
                    aria-describedby={validationErrors[field.name] ? `${field.name}-error` : undefined}
                  />
                  {validationErrors[field.name] ? (
                    <span className="room-form__error" id={`${field.name}-error`}>
                      {validationErrors[field.name]}
                    </span>
                  ) : null}
                </label>
              ))}

              {roomFeedback ? (
                <div
                  className={`room-form__feedback room-form__feedback--${roomFeedback.tone}`}
                  role={roomFeedback.tone === "error" ? "alert" : "status"}
                >
                  {roomFeedback.message}
                </div>
              ) : null}

              <div className="room-form__actions">
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!hasDraftChanges}
                  className="planner-button planner-button--primary"
                >
                  Apply
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleResetRoom}
                  disabled={!hasDraftChanges && isDefaultRoomApplied}
                  className="planner-button planner-button--secondary"
                >
                  Reset
                </Button>
              </div>
            </form>
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
            <div className="planner-stage__badge">Updates after Apply</div>
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
                  {appliedRoomDimensions.length} / {appliedRoomDimensions.width} / {appliedRoomDimensions.height} mm
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
