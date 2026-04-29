import { convertMetersToMillimeters } from "../../../lib/units";

export const resolveWidthMillimeters = ({ widthMm, size }) => {
  if (Number.isFinite(widthMm)) {
    return Math.round(widthMm);
  }

  if (Array.isArray(size) && Number.isFinite(size[0])) {
    return Math.round(convertMetersToMillimeters(size[0]));
  }

  return null;
};

const formatWidthLabel = ({ widthMm, size }) => {
  const resolvedWidth = resolveWidthMillimeters({ widthMm, size });

  return resolvedWidth === null ? null : `${resolvedWidth} mm`;
};

export default formatWidthLabel;
