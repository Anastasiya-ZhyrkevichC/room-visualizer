import { convertMetersToMillimeters } from "../../../lib/units";
import { getStarterCabinetFamilyLabel } from "../../cupboards/model/catalog";
import { BACK_WALL_ID, LEFT_WALL_ID, RIGHT_WALL_ID } from "../../cupboards/model/walls";

const currencyFormatterCache = new Map();

const getCurrencyFormatter = (currency = "USD") => {
  if (!currencyFormatterCache.has(currency)) {
    currencyFormatterCache.set(
      currency,
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }),
    );
  }

  return currencyFormatterCache.get(currency);
};

const moduleCategoryLabels = {
  base: "Base cabinet",
  drawer: "Drawer unit",
  tall: "Tall unit",
  wall: "Wall cabinet",
  corner: "Corner cabinet",
};

const wallLabels = {
  [BACK_WALL_ID]: "Back wall",
  [LEFT_WALL_ID]: "Left wall",
  [RIGHT_WALL_ID]: "Right wall",
};

export const CATALOG_PLACEMENT_CUE = "Places smallest first, resize after selection";
export const HEIGHT_OPTIONS_REFERENCE_NOTE = "Height options are display-only for now";

export const formatRoomDimensions = (dimensions) =>
  `${dimensions.length} x ${dimensions.width} x ${dimensions.height} mm`;

export const formatMillimeterTuple = (values) => values.map((value) => Math.round(value)).join(" x ") + " mm";

export const formatMillimeterOptions = (values) => {
  const normalizedValues = [
    ...new Set((values ?? []).filter((value) => Number.isFinite(value)).map((value) => Math.round(value))),
  ].sort((firstValue, secondValue) => firstValue - secondValue);

  if (normalizedValues.length === 0) {
    return "";
  }

  return `${normalizedValues.join(" / ")} mm`;
};

export const formatModuleDimensions = (module) => formatMillimeterTuple([module.width, module.height, module.depth]);

export const formatModuleWidthOptions = (module) => formatMillimeterOptions(module?.availableWidths ?? [module?.width]);

export const formatModuleHeightOptions = (module) =>
  formatMillimeterOptions(module?.availableHeights ?? [module?.height]);

export const formatModuleDepth = (module) => formatMillimeterOptions([module?.depth]);

export const formatModuleCategory = (category) => moduleCategoryLabels[category] ?? category;

export const formatModuleFamily = (module) =>
  getStarterCabinetFamilyLabel(module) || formatModuleCategory(module?.category);

export const formatWallLabel = (wall) => wallLabels[wall] ?? wall;

export const formatPrototypePrice = (price, currency = "USD") =>
  getCurrencyFormatter(currency).format(Number.isFinite(price) ? price : 0);

export const formatCatalogModulePrice = (module) => {
  const startingPrice = Number.isFinite(module?.startingPrice) ? module.startingPrice : module?.price;
  const maxPrice = Number.isFinite(module?.maxPrice) ? module.maxPrice : startingPrice;
  const currency = module?.currency ?? "USD";

  if (!Number.isFinite(startingPrice)) {
    return "";
  }

  return maxPrice > startingPrice
    ? `From ${formatPrototypePrice(startingPrice, currency)}`
    : formatPrototypePrice(startingPrice, currency);
};

export const formatCatalogPlacementHint = (module) =>
  `Default placement size ${formatModuleDimensions(module)}. ${CATALOG_PLACEMENT_CUE}.`;

export const formatSelectionResizeHint = (wallLabel = null) =>
  wallLabel
    ? `Drag the in-scene side handles to resize through supported widths, or drag the cabinet body to reposition it along the ${wallLabel}.`
    : "Drag the in-scene side handles to resize through supported widths.";

export const formatSelectionPosition = (position) =>
  `X ${Math.round(convertMetersToMillimeters(position.x))} mm · Z ${Math.round(convertMetersToMillimeters(position.z))} mm`;

export const formatTableTopLabel = (tableTopRun) => formatWallLabel(tableTopRun?.wall);

export const formatTableTopDimensions = (tableTopRun) => {
  const sourceDimensions = [tableTopRun?.length, tableTopRun?.depth, tableTopRun?.thickness];

  if (!sourceDimensions.every((dimension) => Number.isFinite(dimension))) {
    return "";
  }

  return formatMillimeterTuple(sourceDimensions.map((dimension) => convertMetersToMillimeters(dimension)));
};
