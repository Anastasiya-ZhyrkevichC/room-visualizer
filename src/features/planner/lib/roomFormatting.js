import { convertMetersToMillimeters } from "../../../lib/units";
import { getStarterCabinetFamilyLabel } from "../../cupboards/model/catalog";

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const moduleCategoryLabels = {
  base: "Base cabinet",
  drawer: "Drawer unit",
  tall: "Tall unit",
  wall: "Wall cabinet",
  corner: "Corner cabinet",
};

export const formatRoomDimensions = (dimensions) =>
  `${dimensions.length} x ${dimensions.width} x ${dimensions.height} mm`;

export const formatMillimeterTuple = (values) => values.map((value) => Math.round(value)).join(" x ") + " mm";

export const formatModuleDimensions = (module) => formatMillimeterTuple([module.width, module.height, module.depth]);

export const formatModuleCategory = (category) => moduleCategoryLabels[category] ?? category;

export const formatModuleFamily = (module) =>
  getStarterCabinetFamilyLabel(module) || formatModuleCategory(module?.category);

export const formatPrototypePrice = (price) => usdFormatter.format(price);

export const formatSelectionPosition = (position) =>
  `X ${Math.round(convertMetersToMillimeters(position.x))} mm · Z ${Math.round(convertMetersToMillimeters(position.z))} mm`;
