import React from "react";
import { Button } from "@mui/material";

import { roomFields } from "../lib/roomValidation";

const RoomSetupPanel = ({
  draftRoomDimensions,
  validationErrors,
  roomFeedback,
  hasDraftChanges,
  isDefaultRoomApplied,
  onRoomChange,
  onApplyRoom,
  onResetRoom,
}) => {
  return (
    <section className="panel-card">
      <div className="panel-card__header">
        <p className="panel-card__eyebrow">Room Setup</p>
        <h2 className="panel-card__title">Define room dimensions</h2>
      </div>
      <p className="panel-card__copy">
        The 3D room updates only after you apply valid dimensions, so temporary edits and validation problems never
        break the scene.
      </p>

      <form className="room-form" onSubmit={onApplyRoom} noValidate>
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
              onChange={onRoomChange}
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
            onClick={onResetRoom}
            disabled={!hasDraftChanges && isDefaultRoomApplied}
            className="planner-button planner-button--secondary"
          >
            Reset
          </Button>
        </div>
      </form>
    </section>
  );
};

export default RoomSetupPanel;
