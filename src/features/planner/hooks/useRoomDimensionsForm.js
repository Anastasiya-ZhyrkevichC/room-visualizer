import { useMemo, useState } from "react";

import { convertMillimetersToMeters } from "../../../lib/units";
import {
  createDraftRoomDimensions,
  defaultRoomDimensions,
  roomFields,
  validateRoomDimensions,
} from "../lib/roomValidation";
import { formatRoomDimensions } from "../lib/roomFormatting";

export const useRoomDimensionsForm = () => {
  const [draftRoomDimensions, setDraftRoomDimensions] = useState(() =>
    createDraftRoomDimensions(defaultRoomDimensions),
  );
  const [appliedRoomDimensions, setAppliedRoomDimensions] = useState(defaultRoomDimensions);
  const [validationErrors, setValidationErrors] = useState({});
  const [roomFeedback, setRoomFeedback] = useState(null);
  const [hasAttemptedApply, setHasAttemptedApply] = useState(false);

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

  const applyImportedRoom = (nextRoomDimensions, sourceLabel = "Imported project") => {
    setDraftRoomDimensions(createDraftRoomDimensions(nextRoomDimensions));
    setAppliedRoomDimensions(nextRoomDimensions);
    setValidationErrors({});
    setHasAttemptedApply(false);
    setRoomFeedback({
      tone: "success",
      message: `${sourceLabel} room loaded: ${formatRoomDimensions(nextRoomDimensions)}.`,
    });
  };

  const hasDraftChanges = useMemo(
    () => roomFields.some((field) => draftRoomDimensions[field.name] !== String(appliedRoomDimensions[field.name])),
    [appliedRoomDimensions, draftRoomDimensions],
  );

  const isDefaultRoomApplied = useMemo(
    () => roomFields.every((field) => appliedRoomDimensions[field.name] === defaultRoomDimensions[field.name]),
    [appliedRoomDimensions],
  );

  const sceneDimensions = useMemo(
    () => ({
      length: convertMillimetersToMeters(appliedRoomDimensions.length),
      width: convertMillimetersToMeters(appliedRoomDimensions.width),
      height: convertMillimetersToMeters(appliedRoomDimensions.height),
    }),
    [appliedRoomDimensions],
  );

  return {
    draftRoomDimensions,
    appliedRoomDimensions,
    validationErrors,
    roomFeedback,
    hasDraftChanges,
    isDefaultRoomApplied,
    sceneDimensions,
    handleRoomChange,
    handleApplyRoom,
    handleResetRoom,
    applyImportedRoom,
  };
};
