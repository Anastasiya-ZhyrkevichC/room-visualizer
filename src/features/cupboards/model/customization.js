import { convertMetersToMillimeters } from "../../../lib/units";
import { resolveCabinetModel } from "./renderModel";
import {
  defaultStarterProjectCustomisation,
  findAccessoryOption,
  findAccessoryPresetOption,
  findCarcassOption,
  findFacadeOption,
  findHandleOption,
  starterAccessoryCatalog,
  starterCarcassCatalog,
  starterFacadeCatalog,
  starterHandleCatalog,
} from "./customizationCatalog";

export const createInheritedCupboardCustomisation = () => ({
  carcassId: null,
  facadeId: null,
  handleId: null,
  accessoryPresetId: null,
  accessoryIds: null,
});

const uniqueIds = (values = []) => [...new Set(values.filter((value) => typeof value === "string" && value.trim() !== ""))];

const resolveCupboardCategory = (cupboard) => cupboard?.category ?? null;

const resolveCupboardFront = (cupboard) => resolveCabinetModel(cupboard?.category, cupboard?.model).front ?? null;

export const getCupboardWidthMm = (cupboard) => {
  if (Number.isFinite(cupboard?.width)) {
    return cupboard.width;
  }

  if (Array.isArray(cupboard?.size) && Number.isFinite(cupboard.size[0])) {
    return Math.round(convertMetersToMillimeters(cupboard.size[0]));
  }

  return null;
};

const isOptionCompatibleWithCategory = (option, cupboard) => {
  const category = resolveCupboardCategory(cupboard);

  if (!option || !Array.isArray(option.compatibleCategories) || option.compatibleCategories.length === 0) {
    return true;
  }

  return option.compatibleCategories.includes(category);
};

const isHandleOptionCompatible = (option, cupboard) => {
  if (!option) {
    return false;
  }

  const frontType = resolveCupboardFront(cupboard)?.type ?? null;

  if (!frontType || !Array.isArray(option.compatibleFrontTypes) || option.compatibleFrontTypes.length === 0) {
    return true;
  }

  return option.compatibleFrontTypes.includes(frontType);
};

const isAccessoryOptionCompatible = (option, cupboard) => {
  if (!option || !isOptionCompatibleWithCategory(option, cupboard)) {
    return false;
  }

  if (!Array.isArray(option.compatibleWidths) || option.compatibleWidths.length === 0) {
    return true;
  }

  return option.compatibleWidths.includes(getCupboardWidthMm(cupboard));
};

const findFirstCompatibleOption = (options, predicate) => options.find((option) => predicate(option)) ?? null;

export const cloneCupboardCustomisation = (customisation = null) => ({
  carcassId: typeof customisation?.carcassId === "string" && customisation.carcassId.trim() !== "" ? customisation.carcassId : null,
  facadeId: typeof customisation?.facadeId === "string" && customisation.facadeId.trim() !== "" ? customisation.facadeId : null,
  handleId: typeof customisation?.handleId === "string" && customisation.handleId.trim() !== "" ? customisation.handleId : null,
  accessoryPresetId:
    typeof customisation?.accessoryPresetId === "string" && customisation.accessoryPresetId.trim() !== ""
      ? customisation.accessoryPresetId
      : null,
  accessoryIds: Array.isArray(customisation?.accessoryIds) ? uniqueIds(customisation.accessoryIds) : null,
});

export const normalizeProjectCustomisation = (projectCustomisation = null) => ({
  carcassId: findCarcassOption(projectCustomisation?.carcassId)?.id ?? defaultStarterProjectCustomisation.carcassId,
  facadeId: findFacadeOption(projectCustomisation?.facadeId)?.id ?? defaultStarterProjectCustomisation.facadeId,
  handleId: findHandleOption(projectCustomisation?.handleId)?.id ?? defaultStarterProjectCustomisation.handleId,
  accessoryPresetId:
    findAccessoryPresetOption(projectCustomisation?.accessoryPresetId)?.id ??
    defaultStarterProjectCustomisation.accessoryPresetId,
});

export const getDefaultProjectCustomisation = () => normalizeProjectCustomisation(defaultStarterProjectCustomisation);

export const getCompatibleCarcassOptions = (cupboard) =>
  starterCarcassCatalog.filter((option) => isOptionCompatibleWithCategory(option, cupboard));

export const getCompatibleFacadeOptions = (cupboard) =>
  starterFacadeCatalog.filter((option) => isOptionCompatibleWithCategory(option, cupboard));

export const getCompatibleHandleOptions = (cupboard) =>
  starterHandleCatalog.filter((option) => isHandleOptionCompatible(option, cupboard));

export const getCompatibleAccessoryOptions = (cupboard) =>
  starterAccessoryCatalog.filter((option) => isAccessoryOptionCompatible(option, cupboard));

export const getAccessoryPresetAccessoryIds = (presetId, cupboard) => {
  const preset = findAccessoryPresetOption(presetId);
  const category = resolveCupboardCategory(cupboard);

  if (!preset || !category) {
    return [];
  }

  return uniqueIds(preset.defaultAccessoryIdsByCategory?.[category] ?? []).filter((accessoryId) =>
    isAccessoryOptionCompatible(findAccessoryOption(accessoryId), cupboard),
  );
};

const resolveConfiguredOption = ({ cupboard, overrideId, projectId, findOption, getCompatibleOptions, isCompatible }) => {
  const compatibleOptions = getCompatibleOptions(cupboard);
  const compatibleOptionIds = new Set(compatibleOptions.map((option) => option.id));
  const projectOption = findOption(projectId);
  const overrideOption = findOption(overrideId);

  if (overrideOption && compatibleOptionIds.has(overrideOption.id) && isCompatible(overrideOption, cupboard)) {
    return {
      option: overrideOption,
      source: "override",
    };
  }

  if (projectOption && compatibleOptionIds.has(projectOption.id) && isCompatible(projectOption, cupboard)) {
    return {
      option: projectOption,
      source: "project",
    };
  }

  return {
    option: findFirstCompatibleOption(compatibleOptions, (option) => isCompatible(option, cupboard)),
    source: "project",
  };
};

export const resolveCompatibleOverrideOrFallback = (cupboard, override) => {
  const rawOverride = cloneCupboardCustomisation(override);

  return {
    carcassId:
      rawOverride.carcassId && isOptionCompatibleWithCategory(findCarcassOption(rawOverride.carcassId), cupboard)
        ? rawOverride.carcassId
        : null,
    facadeId:
      rawOverride.facadeId && isOptionCompatibleWithCategory(findFacadeOption(rawOverride.facadeId), cupboard)
        ? rawOverride.facadeId
        : null,
    handleId:
      rawOverride.handleId && isHandleOptionCompatible(findHandleOption(rawOverride.handleId), cupboard)
        ? rawOverride.handleId
        : null,
    accessoryPresetId: findAccessoryPresetOption(rawOverride.accessoryPresetId)?.id ?? null,
    accessoryIds:
      rawOverride.accessoryIds === null
        ? null
        : rawOverride.accessoryIds.filter((accessoryId) =>
            isAccessoryOptionCompatible(findAccessoryOption(accessoryId), cupboard),
          ),
  };
};

export const resolveEffectiveCustomisation = (cupboard, projectCustomisation) => {
  const resolvedProjectCustomisation = normalizeProjectCustomisation(projectCustomisation);
  const customisation = resolveCompatibleOverrideOrFallback(
    cupboard,
    cupboard?.customisation ?? createInheritedCupboardCustomisation(),
    resolvedProjectCustomisation,
  );

  const carcass = resolveConfiguredOption({
    cupboard,
    overrideId: customisation.carcassId,
    projectId: resolvedProjectCustomisation.carcassId,
    findOption: findCarcassOption,
    getCompatibleOptions: getCompatibleCarcassOptions,
    isCompatible: isOptionCompatibleWithCategory,
  });
  const facade = resolveConfiguredOption({
    cupboard,
    overrideId: customisation.facadeId,
    projectId: resolvedProjectCustomisation.facadeId,
    findOption: findFacadeOption,
    getCompatibleOptions: getCompatibleFacadeOptions,
    isCompatible: isOptionCompatibleWithCategory,
  });
  const handle = resolveConfiguredOption({
    cupboard,
    overrideId: customisation.handleId,
    projectId: resolvedProjectCustomisation.handleId,
    findOption: findHandleOption,
    getCompatibleOptions: getCompatibleHandleOptions,
    isCompatible: isHandleOptionCompatible,
  });
  const effectiveAccessoryPresetId =
    findAccessoryPresetOption(customisation.accessoryPresetId)?.id ?? resolvedProjectCustomisation.accessoryPresetId;
  const presetAccessoryIds = getAccessoryPresetAccessoryIds(effectiveAccessoryPresetId, cupboard);
  const effectiveAccessoryIds =
    customisation.accessoryIds !== null ? customisation.accessoryIds : presetAccessoryIds;
  const effectiveAccessories = effectiveAccessoryIds
    .map((accessoryId) => findAccessoryOption(accessoryId))
    .filter((option) => isAccessoryOptionCompatible(option, cupboard));

  return {
    effectiveCustomisation: {
      carcassId: carcass.option?.id ?? null,
      facadeId: facade.option?.id ?? null,
      handleId: handle.option?.id ?? null,
      accessoryPresetId: effectiveAccessoryPresetId,
      accessoryIds: effectiveAccessories.map((option) => option.id),
    },
    options: {
      carcass: carcass.option,
      facade: facade.option,
      handle: handle.option,
      accessoryPreset: findAccessoryPresetOption(effectiveAccessoryPresetId),
      accessories: effectiveAccessories,
    },
    sources: {
      carcass: carcass.source,
      facade: facade.source,
      handle: handle.source,
      accessoryPreset: customisation.accessoryPresetId ? "override" : "project",
      accessories:
        customisation.accessoryIds !== null
          ? "override"
          : customisation.accessoryPresetId
            ? "override-preset"
            : "project-preset",
    },
    compatibility: {
      isValid: true,
      issues: [],
    },
    rawCustomisation: customisation,
    projectCustomisation: resolvedProjectCustomisation,
  };
};

export const hasCupboardCustomisationOverrides = (cupboard) => {
  const customisation = cloneCupboardCustomisation(cupboard?.customisation);

  return (
    customisation.carcassId !== null ||
    customisation.facadeId !== null ||
    customisation.handleId !== null ||
    customisation.accessoryPresetId !== null ||
    customisation.accessoryIds !== null
  );
};

export const resolveCupboardAppearanceTheme = (cupboard, projectCustomisation) => {
  const { options } = resolveEffectiveCustomisation(cupboard, projectCustomisation);

  return {
    bodyColor: options.carcass?.appearance?.bodyColor ?? "#b89b78",
    frontColor: options.facade?.appearance?.frontColor ?? "#efe1cf",
    interiorColor: options.carcass?.appearance?.interiorColor ?? "#9d7c5d",
    handleColor: options.handle?.appearance?.handleColor ?? "#5d564e",
    legColor: options.carcass?.appearance?.legColor ?? "#4b4036",
  };
};

export const resolveCupboardModelWithCustomisation = (cupboard, projectCustomisation) => {
  const resolvedModel = resolveCabinetModel(cupboard?.category, cupboard?.model);
  const { options } = resolveEffectiveCustomisation(cupboard, projectCustomisation);
  const handleLengthMm = options.handle?.dimensions?.defaultLengthMm ?? null;

  if (!resolvedModel.front?.handle || !Number.isFinite(handleLengthMm)) {
    return resolvedModel;
  }

  return {
    ...resolvedModel,
    front: {
      ...resolvedModel.front,
      handle: {
        ...resolvedModel.front.handle,
        lengthMm: handleLengthMm,
      },
    },
  };
};
