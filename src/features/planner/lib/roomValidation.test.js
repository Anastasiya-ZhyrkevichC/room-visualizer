import { createDraftRoomDimensions, validateRoomDimensions } from "./roomValidation";

describe("roomValidation", () => {
  it("creates string draft values from numeric dimensions", () => {
    expect(createDraftRoomDimensions({ length: 5000, width: 4000, height: 3000 })).toEqual({
      length: "5000",
      width: "4000",
      height: "3000",
    });
  });

  it("rejects empty and non-positive values", () => {
    expect(validateRoomDimensions({ length: "", width: "0", height: "-20" })).toEqual({
      errors: {
        length: "Length is required.",
        width: "Width must be greater than 0 mm.",
        height: "Height cannot be negative.",
      },
      parsedDimensions: {},
      isValid: false,
    });
  });

  it("parses valid room dimensions", () => {
    expect(validateRoomDimensions({ length: "6200", width: "4100", height: "2800" })).toEqual({
      errors: {},
      parsedDimensions: {
        length: 6200,
        width: 4100,
        height: 2800,
      },
      isValid: true,
    });
  });
});
