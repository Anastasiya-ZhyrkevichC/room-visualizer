import {
  STARTER_CABINET_CATALOG_VERSION,
  STARTER_CABINET_PRICE_CURRENCY,
  findStarterCabinet,
  findStarterCabinetVariant,
} from "../../cupboards/model/catalog";
import {
  cloneCupboardCustomisation,
  createInheritedCupboardCustomisation,
  getDefaultProjectCustomisation,
  normalizeProjectCustomisation,
} from "../../cupboards/model/customization";
import { createCupboard } from "../../cupboards/model/placement";

export const PROJECT_SCHEMA_VERSION = 2;
export const PROJECT_FILE_EXTENSION = ".room-project.json";
const LEGACY_PROJECT_SCHEMA_VERSION = 1;

const DEFAULT_PROJECT_NAME = "Kitchen plan";
const DEFAULT_EXPORT_FILE_PREFIX = "kitchen-plan";

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

const requireFiniteNumber = (value, label) => {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    throw new Error(`${label} must be a finite number.`);
  }

  return parsedValue;
};

const requirePositiveInteger = (value, label) => {
  const parsedValue = requireFiniteNumber(value, label);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${label} must be a positive integer.`);
  }

  return parsedValue;
};

const sanitizeString = (value, fallback = "") => (typeof value === "string" ? value : fallback);

const sanitizeNumberArray = (values) =>
  Array.isArray(values) ? values.map((value) => Number(value)).filter((value) => Number.isFinite(value)) : [];

const createProjectId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `project-${Date.now()}`;

const normalizeTimestamp = (value) => {
  if (typeof value !== "string" || value.trim() === "") {
    return new Date().toISOString();
  }

  const parsedValue = new Date(value);

  return Number.isNaN(parsedValue.getTime()) ? new Date().toISOString() : parsedValue.toISOString();
};

const slugifyProjectName = (projectName = DEFAULT_PROJECT_NAME) => {
  const slug = projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || DEFAULT_EXPORT_FILE_PREFIX;
};

const serializePosition = (position = {}) => ({
  x: Number.isFinite(position.x) ? position.x : 0,
  y: Number.isFinite(position.y) ? position.y : 0,
  z: Number.isFinite(position.z) ? position.z : 0,
});

const serializeCabinetSnapshot = (cupboard = {}) => ({
  name: sanitizeString(cupboard.name, "Unnamed cabinet"),
  category: sanitizeString(cupboard.category, ""),
  catalogFamily: sanitizeString(cupboard.catalogFamily, ""),
  model: cupboard.model ?? null,
  tableTopProfile: cupboard.tableTopProfile ?? null,
  currency: sanitizeString(cupboard.currency, STARTER_CABINET_PRICE_CURRENCY),
  price: Number.isFinite(cupboard.price) ? cupboard.price : null,
  widthMm: Number.isFinite(cupboard.width) ? cupboard.width : null,
  heightMm: Number.isFinite(cupboard.height) ? cupboard.height : null,
  depthMm: Number.isFinite(cupboard.depth) ? cupboard.depth : null,
  sizeMeters: Array.isArray(cupboard.size) ? cupboard.size.map((value) => Number(value)) : [],
  availableWidthsMm: sanitizeNumberArray(cupboard.availableWidths),
  availableHeightsMm: sanitizeNumberArray(cupboard.availableHeights),
  defaultVariantId: sanitizeString(cupboard.defaultVariantId, ""),
  activeVariantId: sanitizeString(cupboard.activeVariantId, ""),
});

const serializeCupboardCustomisation = (customisation = {}) => ({
  carcassId: typeof customisation?.carcassId === "string" && customisation.carcassId.trim() !== "" ? customisation.carcassId : null,
  facadeId: typeof customisation?.facadeId === "string" && customisation.facadeId.trim() !== "" ? customisation.facadeId : null,
  handleId: typeof customisation?.handleId === "string" && customisation.handleId.trim() !== "" ? customisation.handleId : null,
  accessoryPresetId:
    typeof customisation?.accessoryPresetId === "string" && customisation.accessoryPresetId.trim() !== ""
      ? customisation.accessoryPresetId
      : null,
  accessoryIds: Array.isArray(customisation?.accessoryIds)
    ? customisation.accessoryIds.filter((value) => typeof value === "string" && value.trim() !== "")
    : null,
});

const serializePricingLineItem = (lineItem = {}) => ({
  cupboardId: Number.isFinite(lineItem.cupboardId) ? lineItem.cupboardId : null,
  instanceId: Number.isFinite(lineItem.instanceId) ? lineItem.instanceId : null,
  catalogId: sanitizeString(lineItem.catalogId, ""),
  activeVariantId: sanitizeString(lineItem.activeVariantId, ""),
  displayName: sanitizeString(lineItem.displayName, "Unnamed cabinet"),
  dimensionsLabel: sanitizeString(lineItem.dimensionsLabel, ""),
  price: Number.isFinite(lineItem.totalPrice ?? lineItem.price) ? lineItem.totalPrice ?? lineItem.price : null,
  totalPrice: Number.isFinite(lineItem.totalPrice ?? lineItem.price) ? lineItem.totalPrice ?? lineItem.price : null,
  bodyPrice: Number.isFinite(lineItem.bodyPrice) ? lineItem.bodyPrice : null,
  carcassPrice: Number.isFinite(lineItem.carcassPrice) ? lineItem.carcassPrice : null,
  facadePrice: Number.isFinite(lineItem.facadePrice) ? lineItem.facadePrice : null,
  handlePrice: Number.isFinite(lineItem.handlePrice) ? lineItem.handlePrice : null,
  accessoriesPrice: Number.isFinite(lineItem.accessoriesPrice) ? lineItem.accessoriesPrice : null,
  currency: sanitizeString(lineItem.currency, STARTER_CABINET_PRICE_CURRENCY),
  isUnavailable: Boolean(lineItem.isUnavailable),
});

const parseRoomDimensions = (room = {}) => ({
  length: requirePositiveInteger(room.lengthMm, "room.lengthMm"),
  width: requirePositiveInteger(room.widthMm, "room.widthMm"),
  height: requirePositiveInteger(room.heightMm, "room.heightMm"),
});

const parsePosition = (position = {}) => ({
  x: requireFiniteNumber(position.x, "module.position.x"),
  y: requireFiniteNumber(position.y, "module.position.y"),
  z: requireFiniteNumber(position.z, "module.position.z"),
});

const parseProjectCustomisation = (projectCustomisation = {}) =>
  normalizeProjectCustomisation({
    carcassId: sanitizeString(projectCustomisation?.carcassId, ""),
    facadeId: sanitizeString(projectCustomisation?.facadeId, ""),
    handleId: sanitizeString(projectCustomisation?.handleId, ""),
    accessoryPresetId: sanitizeString(projectCustomisation?.accessoryPresetId, ""),
  });

const parseCupboardCustomisation = (customisation = {}) =>
  cloneCupboardCustomisation({
    carcassId: sanitizeString(customisation?.carcassId, ""),
    facadeId: sanitizeString(customisation?.facadeId, ""),
    handleId: sanitizeString(customisation?.handleId, ""),
    accessoryPresetId: sanitizeString(customisation?.accessoryPresetId, ""),
    accessoryIds: Array.isArray(customisation?.accessoryIds)
      ? customisation.accessoryIds.filter((value) => typeof value === "string" && value.trim() !== "")
      : null,
  });

const parsePricingSnapshot = (pricingSnapshot = {}, savedAt) => {
  const lineItems = Array.isArray(pricingSnapshot.lineItems)
    ? pricingSnapshot.lineItems.map((lineItem, index) => ({
        cupboardId: Number.isFinite(lineItem?.cupboardId) ? lineItem.cupboardId : null,
        instanceId: requirePositiveInteger(
          lineItem?.instanceId ?? lineItem?.cupboardId,
          `pricingSnapshot.lineItems[${index}].instanceId`,
        ),
        catalogId: sanitizeString(lineItem?.catalogId, ""),
        activeVariantId: sanitizeString(lineItem?.activeVariantId, ""),
        displayName: sanitizeString(lineItem?.displayName, "Unnamed cabinet"),
        dimensionsLabel: sanitizeString(lineItem?.dimensionsLabel, ""),
        price: isFiniteNumber(lineItem?.totalPrice) ? lineItem.totalPrice : isFiniteNumber(lineItem?.price) ? lineItem.price : null,
        totalPrice:
          isFiniteNumber(lineItem?.totalPrice) ? lineItem.totalPrice : isFiniteNumber(lineItem?.price) ? lineItem.price : null,
        bodyPrice: isFiniteNumber(lineItem?.bodyPrice) ? lineItem.bodyPrice : null,
        carcassPrice: isFiniteNumber(lineItem?.carcassPrice) ? lineItem.carcassPrice : null,
        facadePrice: isFiniteNumber(lineItem?.facadePrice) ? lineItem.facadePrice : null,
        handlePrice: isFiniteNumber(lineItem?.handlePrice) ? lineItem.handlePrice : null,
        accessoriesPrice: isFiniteNumber(lineItem?.accessoriesPrice) ? lineItem.accessoriesPrice : null,
        currency: sanitizeString(lineItem?.currency, STARTER_CABINET_PRICE_CURRENCY),
        isUnavailable: Boolean(lineItem?.isUnavailable),
      }))
    : [];

  return {
    savedAt: normalizeTimestamp(pricingSnapshot.savedAt ?? savedAt),
    currency: sanitizeString(pricingSnapshot.currency, lineItems[0]?.currency ?? STARTER_CABINET_PRICE_CURRENCY),
    lineItems,
    totalPrice: isFiniteNumber(pricingSnapshot.totalPrice) ? pricingSnapshot.totalPrice : 0,
    objectCount: Number.isInteger(pricingSnapshot.objectCount) ? pricingSnapshot.objectCount : lineItems.length,
    unresolvedItemCount: Number.isInteger(pricingSnapshot.unresolvedItemCount)
      ? pricingSnapshot.unresolvedItemCount
      : lineItems.filter((lineItem) => lineItem.isUnavailable).length,
    isResolved: pricingSnapshot.isResolved !== false,
  };
};

const parseCabinetSnapshot = (snapshot = {}, index) => {
  const width = isFiniteNumber(snapshot.widthMm) ? snapshot.widthMm : null;
  const height = isFiniteNumber(snapshot.heightMm) ? snapshot.heightMm : null;
  const depth = isFiniteNumber(snapshot.depthMm) ? snapshot.depthMm : null;
  const sizeMeters = sanitizeNumberArray(snapshot.sizeMeters);

  return {
    name: sanitizeString(snapshot.name, `Imported cabinet ${index + 1}`),
    category: sanitizeString(snapshot.category, ""),
    catalogFamily: sanitizeString(snapshot.catalogFamily, ""),
    model: snapshot.model ?? null,
    tableTopProfile: snapshot.tableTopProfile ?? null,
    currency: sanitizeString(snapshot.currency, STARTER_CABINET_PRICE_CURRENCY),
    price: isFiniteNumber(snapshot.price) ? snapshot.price : null,
    width,
    height,
    depth,
    size: sizeMeters.length === 3 ? sizeMeters : [width, height, depth].map((value) => (value ?? 0) / 1000),
    availableWidths: sanitizeNumberArray(snapshot.availableWidthsMm),
    availableHeights: sanitizeNumberArray(snapshot.availableHeightsMm),
    defaultVariantId: sanitizeString(snapshot.defaultVariantId, ""),
    activeVariantId: sanitizeString(snapshot.activeVariantId, ""),
  };
};

const parseModule = (moduleRecord = {}, index, schemaVersion = PROJECT_SCHEMA_VERSION) => {
  const catalogId = sanitizeString(moduleRecord.catalogItemId, "");

  return {
    id: requirePositiveInteger(moduleRecord.id, `modules[${index}].id`),
    catalogId,
    activeVariantId: sanitizeString(moduleRecord.activeVariantId, ""),
    defaultVariantId: sanitizeString(moduleRecord.defaultVariantId, ""),
    wall: sanitizeString(moduleRecord.wall, "back"),
    rotation: requireFiniteNumber(moduleRecord.rotation ?? 0, `modules[${index}].rotation`),
    position: parsePosition(moduleRecord.position),
    cabinetSnapshot: parseCabinetSnapshot(moduleRecord.cabinetSnapshot ?? {}, index),
    customisation:
      schemaVersion >= 2
        ? parseCupboardCustomisation(moduleRecord.customisation ?? {})
        : createInheritedCupboardCustomisation(),
  };
};

const rehydrateUnavailableCupboard = (moduleRecord, unavailableReason) => {
  const snapshot = moduleRecord.cabinetSnapshot;

  if (!snapshot.size.every((value) => Number.isFinite(value) && value >= 0)) {
    throw new Error(
      `modules[${moduleRecord.id}] cannot be restored because the source cabinet is unavailable and the saved size is invalid.`,
    );
  }

  return {
    id: moduleRecord.id,
    catalogId: moduleRecord.catalogId || null,
    defaultVariantId: moduleRecord.defaultVariantId || snapshot.defaultVariantId || null,
    activeVariantId: moduleRecord.activeVariantId || snapshot.activeVariantId || null,
    name: snapshot.name,
    category: snapshot.category || null,
    catalogFamily: snapshot.catalogFamily || null,
    model: snapshot.model,
    currency: snapshot.currency,
    tableTopProfile: snapshot.tableTopProfile,
    availableWidths: snapshot.availableWidths,
    availableHeights: snapshot.availableHeights,
    width: snapshot.width,
    height: snapshot.height,
    depth: snapshot.depth,
    price: snapshot.price,
    size: snapshot.size,
    position: moduleRecord.position,
    rotation: moduleRecord.rotation,
    wall: moduleRecord.wall,
    customisation: moduleRecord.customisation,
    isUnavailable: true,
    unavailableReason,
  };
};

const rehydrateImportedCupboard = (moduleRecord) => {
  const catalogItem = findStarterCabinet(moduleRecord.catalogId);
  const variantId = moduleRecord.activeVariantId || moduleRecord.cabinetSnapshot.activeVariantId || null;
  const matchingVariant = moduleRecord.catalogId ? findStarterCabinetVariant(moduleRecord.catalogId, variantId) : null;

  if (catalogItem && (!variantId || matchingVariant)) {
    return createCupboard({
      id: moduleRecord.id,
      cabinet: {
        catalogId: moduleRecord.catalogId,
        activeVariantId: variantId,
        customisation: moduleRecord.customisation,
      },
      position: moduleRecord.position,
      rotation: moduleRecord.rotation,
      wall: moduleRecord.wall,
    });
  }

  return rehydrateUnavailableCupboard(moduleRecord, catalogItem ? "missing-variant" : "missing-catalog-item");
};

export const createProjectPricingSnapshot = (pricingSummary = {}, savedAt = new Date().toISOString()) => ({
  savedAt,
  currency: sanitizeString(pricingSummary.currency, STARTER_CABINET_PRICE_CURRENCY),
  lineItems: Array.isArray(pricingSummary.lineItems) ? pricingSummary.lineItems.map(serializePricingLineItem) : [],
  totalPrice: Number.isFinite(pricingSummary.totalPrice) ? pricingSummary.totalPrice : 0,
  objectCount: Number.isInteger(pricingSummary.objectCount)
    ? pricingSummary.objectCount
    : Array.isArray(pricingSummary.lineItems)
      ? pricingSummary.lineItems.length
      : 0,
  unresolvedItemCount: Number.isInteger(pricingSummary.unavailableCount)
    ? pricingSummary.unavailableCount
    : Array.isArray(pricingSummary.lineItems)
      ? pricingSummary.lineItems.filter((lineItem) => lineItem?.isUnavailable).length
      : 0,
  isResolved: pricingSummary.isResolved !== false,
});

export const createProjectDocument = ({
  cupboards = [],
  pricingSummary,
  projectCustomisation = getDefaultProjectCustomisation(),
  projectId = createProjectId(),
  projectName = DEFAULT_PROJECT_NAME,
  roomDimensions,
  savedAt = new Date().toISOString(),
} = {}) => {
  const normalizedSavedAt = normalizeTimestamp(savedAt);
  const pricingSnapshot = createProjectPricingSnapshot(pricingSummary, normalizedSavedAt);
  const modules = [...cupboards]
    .sort((firstCupboard, secondCupboard) => firstCupboard.id - secondCupboard.id)
    .map((cupboard) => ({
      id: cupboard.id,
      catalogItemId: sanitizeString(cupboard.catalogId, ""),
      activeVariantId: sanitizeString(cupboard.activeVariantId, ""),
      defaultVariantId: sanitizeString(cupboard.defaultVariantId, ""),
      wall: sanitizeString(cupboard.wall, "back"),
      rotation: Number.isFinite(cupboard.rotation) ? cupboard.rotation : 0,
      position: serializePosition(cupboard.position),
      customisation: serializeCupboardCustomisation(cupboard.customisation),
      cabinetSnapshot: serializeCabinetSnapshot(cupboard),
    }));

  return {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    projectId,
    projectName,
    savedAt: normalizedSavedAt,
    catalogVersion: STARTER_CABINET_CATALOG_VERSION,
    projectCustomisation: parseProjectCustomisation(projectCustomisation),
    room: {
      lengthMm: requirePositiveInteger(roomDimensions?.length, "room.length"),
      widthMm: requirePositiveInteger(roomDimensions?.width, "room.width"),
      heightMm: requirePositiveInteger(roomDimensions?.height, "room.height"),
    },
    modules,
    pricingSnapshot,
  };
};

export const parseProjectDocument = (projectDocumentText) => {
  let rawProjectDocument;

  try {
    rawProjectDocument = JSON.parse(projectDocumentText);
  } catch (error) {
    throw new Error("Imported file is not valid JSON.");
  }

  if (!rawProjectDocument || typeof rawProjectDocument !== "object" || Array.isArray(rawProjectDocument)) {
    throw new Error("Imported file must contain a project object.");
  }

  const schemaVersion = Number(rawProjectDocument.schemaVersion);

  if (schemaVersion !== PROJECT_SCHEMA_VERSION && schemaVersion !== LEGACY_PROJECT_SCHEMA_VERSION) {
    throw new Error(`Imported project schemaVersion ${rawProjectDocument.schemaVersion} is not supported.`);
  }

  const savedAt = normalizeTimestamp(rawProjectDocument.savedAt);
  const modules = Array.isArray(rawProjectDocument.modules)
    ? rawProjectDocument.modules.map((moduleRecord, index) => parseModule(moduleRecord, index, schemaVersion))
    : [];

  return {
    schemaVersion,
    projectId: sanitizeString(rawProjectDocument.projectId, createProjectId()),
    projectName: sanitizeString(rawProjectDocument.projectName, DEFAULT_PROJECT_NAME),
    savedAt,
    catalogVersion: sanitizeString(rawProjectDocument.catalogVersion, ""),
    roomDimensions: parseRoomDimensions(rawProjectDocument.room),
    projectCustomisation:
      schemaVersion >= PROJECT_SCHEMA_VERSION
        ? parseProjectCustomisation(rawProjectDocument.projectCustomisation ?? {})
        : getDefaultProjectCustomisation(),
    pricingSnapshot: parsePricingSnapshot(rawProjectDocument.pricingSnapshot, savedAt),
    cupboards: modules.map(rehydrateImportedCupboard),
    migration:
      schemaVersion === LEGACY_PROJECT_SCHEMA_VERSION
        ? {
            fromSchemaVersion: LEGACY_PROJECT_SCHEMA_VERSION,
            message:
              "This older project was loaded with the current default cabinet customisation settings because schema version 1 files did not store facade, handle, carcass, or accessory choices.",
          }
        : null,
  };
};

export const reconcilePricingSnapshot = ({ currentPricingSummary, pricingSnapshot }) => {
  if (!pricingSnapshot) {
    return null;
  }

  const currentLineItems = Array.isArray(currentPricingSummary?.lineItems) ? currentPricingSummary.lineItems : [];
  const snapshotLineItems = Array.isArray(pricingSnapshot.lineItems) ? pricingSnapshot.lineItems : [];
  const currentItemsByInstanceId = new Map(
    currentLineItems.map((lineItem) => [lineItem.instanceId ?? lineItem.cupboardId, lineItem]),
  );
  const referenceItems = snapshotLineItems.map((snapshotItem) => {
    const instanceId = snapshotItem.instanceId ?? snapshotItem.cupboardId;
    const currentItem = currentItemsByInstanceId.get(instanceId);
    let status = "matched";

    if (!currentItem) {
      status = "removed";
    } else if (currentItem.isUnavailable) {
      status = "unavailable";
    } else if (
      currentItem.catalogId !== snapshotItem.catalogId ||
      currentItem.displayName !== snapshotItem.displayName ||
      currentItem.currency !== snapshotItem.currency ||
      (currentItem.totalPrice ?? currentItem.price) !== (snapshotItem.totalPrice ?? snapshotItem.price)
    ) {
      status = "changed";
    }

    return {
      ...snapshotItem,
      instanceId,
      liveDisplayName: currentItem?.displayName ?? null,
      liveDimensionsLabel: currentItem?.dimensionsLabel ?? null,
      liveCurrency: currentItem?.currency ?? currentPricingSummary?.currency ?? snapshotItem.currency,
      livePrice: currentItem?.isUnavailable ? null : (currentItem?.totalPrice ?? currentItem?.price ?? null),
      status,
      deltaPrice:
        Number.isFinite(snapshotItem.totalPrice ?? snapshotItem.price) &&
        Number.isFinite(currentItem?.totalPrice ?? currentItem?.price)
          ? (currentItem.totalPrice ?? currentItem.price) - (snapshotItem.totalPrice ?? snapshotItem.price)
          : null,
    };
  });

  const snapshotInstanceIds = new Set(referenceItems.map((item) => item.instanceId));
  const liveOnlyLineItems = currentLineItems.filter(
    (lineItem) => !snapshotInstanceIds.has(lineItem.instanceId ?? lineItem.cupboardId),
  );
  const changedCount = referenceItems.filter((item) => item.status === "changed").length;
  const unavailableCount = referenceItems.filter((item) => item.status === "unavailable").length;
  const removedCount = referenceItems.filter((item) => item.status === "removed").length;
  const isLiveTotalComparable = currentPricingSummary?.isResolved !== false;

  return {
    items: referenceItems,
    liveOnlyLineItems,
    changedCount,
    unavailableCount,
    removedCount,
    liveOnlyCount: liveOnlyLineItems.length,
    hasDifferences: changedCount > 0 || unavailableCount > 0 || removedCount > 0 || liveOnlyLineItems.length > 0,
    isLiveTotalComparable,
    liveTotalDelta:
      isLiveTotalComparable &&
      Number.isFinite(pricingSnapshot.totalPrice) &&
      Number.isFinite(currentPricingSummary?.totalPrice)
        ? currentPricingSummary.totalPrice - pricingSnapshot.totalPrice
        : null,
  };
};

export const createProjectFileName = ({
  projectName = DEFAULT_PROJECT_NAME,
  savedAt = new Date().toISOString(),
} = {}) => {
  const normalizedSavedAt = normalizeTimestamp(savedAt).slice(0, 10);

  return `${slugifyProjectName(projectName)}-${normalizedSavedAt}${PROJECT_FILE_EXTENSION}`;
};

export const stringifyProjectDocument = (projectDocument) => JSON.stringify(projectDocument, null, 2);

export const downloadProjectDocument = (projectDocument, fileName = createProjectFileName(projectDocument)) => {
  const serializedProjectDocument = stringifyProjectDocument(projectDocument);

  if (typeof window === "undefined" || typeof document === "undefined") {
    return { fileName, contents: serializedProjectDocument };
  }

  const blob = new Blob([serializedProjectDocument], { type: "application/json" });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);

  return { fileName };
};

export const readProjectFile = async (file) => {
  if (!file) {
    throw new Error("No project file selected.");
  }

  if (typeof file.text === "function") {
    return file.text();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error(`Unable to read "${file.name ?? "project file"}".`));
    reader.readAsText(file);
  });
};
