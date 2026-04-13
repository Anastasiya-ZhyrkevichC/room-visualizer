import { convertMetersToMillimeters } from "../../../lib/units";

export const formatRoomDimensions = (dimensions) =>
  `${dimensions.length} x ${dimensions.width} x ${dimensions.height} mm`;

export const formatMillimeterTuple = (values) => values.map((value) => Math.round(value)).join(" x ") + " mm";

export const formatSelectionPosition = (position) =>
  `X ${Math.round(convertMetersToMillimeters(position.x))} mm · Z ${Math.round(convertMetersToMillimeters(position.z))} mm`;
