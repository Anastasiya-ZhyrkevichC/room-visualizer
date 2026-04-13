import React, { useState } from "react";
import { Button } from "@mui/material";

import RotatingCubeWrapper from "./RotatingCubeWrapper";
import { getCupboardFootprint, getCupboardRotationDegrees, useCupboards } from "./CupBoardProvider";

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

const createDraftRoomDimensions = (dimensions) =>
  roomFields.reduce((draft, field) => ({ ...draft, [field.name]: String(dimensions[field.name]) }), {});

const formatRoomDimensions = (dimensions) => `${dimensions.length} x ${dimensions.width} x ${dimensions.height} mm`;
const formatMillimeterTuple = (values) => values.map((value) => Math.round(value)).join(" x ") + " mm";
const formatSelectionPosition = (position) =>
  `X ${Math.round(position.x * 1000)} mm · Z ${Math.round(position.z * 1000)} mm`;

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
  const {
    addCupboard,
    cupboards,
    starterCabinetCatalog,
    selectedCupboard,
    clearSelection,
    rotateSelectedCupboard,
    deleteSelectedCupboard,
  } = useCupboards();

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
  const selectedCupboardFootprint = selectedCupboard
    ? getCupboardFootprint(selectedCupboard.size, selectedCupboard.rotation)
    : null;
  const selectedRotationDegrees = selectedCupboard ? getCupboardRotationDegrees(selectedCupboard.rotation) : null;
  const selectedFootprintDimensionsMm = selectedCupboardFootprint
    ? [selectedCupboardFootprint.width * 1000, selectedCupboardFootprint.depth * 1000]
    : null;
  const selectionBadge = selectedCupboard ? `${selectedCupboard.name} selected` : "Click a cabinet to select it";

  return (
    <div className="planner-page">
      <header className="planner-header">
        <div>
          <p className="planner-header__eyebrow">Kitchen Planner Prototype · Step 4</p>
          <h1 className="planner-header__title">Select a cabinet, then rotate or remove it.</h1>
          <p className="planner-header__copy">
            Keep the room dimensions stable, add starter cabinets from the catalog, and click a placed module in the
            scene to edit it from the inspector on the right.
          </p>
        </div>
        <div className="planner-header__stats" aria-label="Planner overview">
          <div className="planner-stat">
            <span className="planner-stat__label">Room shell in scene</span>
            <strong className="planner-stat__value">{formatRoomDimensions(appliedRoomDimensions)}</strong>
          </div>
          <div className="planner-stat">
            <span className="planner-stat__label">Current selection</span>
            <strong className="planner-stat__value">{selectedCupboard ? selectedCupboard.name : "None"}</strong>
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
              <p className="panel-card__eyebrow">Starter Catalog</p>
              <h2 className="panel-card__title">Add a cabinet</h2>
            </div>
            <p className="panel-card__copy">
              New cabinets snap into a predictable run along the back wall and become selected immediately so you can
              edit them without an extra click.
            </p>

            <div className="catalog-list">
              {starterCabinetCatalog.map((cabinet) => (
                <article className="catalog-card" key={cabinet.id}>
                  <div className="catalog-card__content">
                    <strong className="catalog-card__title">{cabinet.name}</strong>
                    <span className="catalog-card__size">{formatMillimeterTuple(cabinet.dimensionsMm)}</span>
                    <p className="catalog-card__copy">{cabinet.description}</p>
                  </div>

                  <Button
                    variant="outlined"
                    onClick={() => addCupboard(cabinet.id)}
                    className="planner-button planner-button--secondary"
                  >
                    Add
                  </Button>
                </article>
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
            <div className={`planner-stage__badge${selectedCupboard ? " planner-stage__badge--active" : ""}`}>
              {selectionBadge}
            </div>
          </div>

          <div className="planner-stage__canvas">
            <RotatingCubeWrapper length={sceneLength} width={sceneWidth} height={sceneHeight} />
          </div>
        </main>

        <aside className="planner-panel planner-panel--right">
          <section className="panel-card">
            <div className="panel-card__header">
              <p className="panel-card__eyebrow">Cabinet Inspector</p>
              <h2 className="panel-card__title">Selected cabinet</h2>
            </div>

            {selectedCupboard ? (
              <div className="selection-panel">
                <div className="selection-panel__hero">
                  <span className="selection-panel__tag">Selected in scene</span>
                  <strong className="selection-panel__name">{selectedCupboard.name}</strong>
                  <p className="selection-panel__copy">{selectedCupboard.description}</p>
                </div>

                <div className="selection-details">
                  <div className="selection-details__item">
                    <span className="selection-details__label">Cabinet size</span>
                    <strong className="selection-details__value">
                      {formatMillimeterTuple(selectedCupboard.dimensionsMm)}
                    </strong>
                  </div>
                  <div className="selection-details__item">
                    <span className="selection-details__label">Current footprint</span>
                    <strong className="selection-details__value">
                      {selectedFootprintDimensionsMm ? formatMillimeterTuple(selectedFootprintDimensionsMm) : "N/A"}
                    </strong>
                  </div>
                  <div className="selection-details__item">
                    <span className="selection-details__label">Rotation</span>
                    <strong className="selection-details__value">{selectedRotationDegrees}°</strong>
                  </div>
                  <div className="selection-details__item">
                    <span className="selection-details__label">Scene position</span>
                    <strong className="selection-details__value">
                      {formatSelectionPosition(selectedCupboard.position)}
                    </strong>
                  </div>
                </div>

                <div className="selection-actions">
                  <Button
                    type="button"
                    variant="contained"
                    onClick={rotateSelectedCupboard}
                    className="planner-button planner-button--primary"
                  >
                    Rotate 90°
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={deleteSelectedCupboard}
                    className="planner-button planner-button--danger"
                  >
                    Delete
                  </Button>
                </div>

                <Button type="button" variant="text" onClick={clearSelection} className="selection-panel__clear">
                  Clear selection
                </Button>
              </div>
            ) : (
              <div className="empty-state">
                <strong className="empty-state__title">Nothing selected yet</strong>
                <p className="empty-state__copy">
                  Click a cabinet in the 3D room to inspect it here, rotate it 90 degrees, or delete it from the layout.
                </p>
              </div>
            )}
          </section>

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
              Pricing, cabinet totals, and project notes can build on this selection flow in the next step.
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default RoomVisualizer;
