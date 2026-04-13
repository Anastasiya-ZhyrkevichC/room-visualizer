export const defaultRoomDimensions = {
  length: 5000,
  width: 4000,
  height: 3000,
};

export const roomFields = [
  { name: "length", label: "Length", unit: "mm" },
  { name: "width", label: "Width", unit: "mm" },
  { name: "height", label: "Height", unit: "mm" },
];

export const createDraftRoomDimensions = (dimensions) =>
  roomFields.reduce((draft, field) => ({ ...draft, [field.name]: String(dimensions[field.name]) }), {});

export const validateRoomDimensions = (dimensions) => {
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
