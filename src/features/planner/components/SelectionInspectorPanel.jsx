import React from "react";
import { Button } from "@mui/material";

import { convertMetersToMillimeters } from "../../../lib/units";
import {
  findAccessoryPresetOption,
  findCarcassOption,
  findFacadeOption,
  findHandleOption,
  starterAccessoryPresetCatalog,
} from "../../cupboards/model/customizationCatalog";
import {
  cloneCupboardCustomisation,
  createInheritedCupboardCustomisation,
  getCompatibleAccessoryOptions,
  getCompatibleCarcassOptions,
  getCompatibleFacadeOptions,
  getCompatibleHandleOptions,
  hasCupboardCustomisationOverrides,
} from "../../cupboards/model/customization";
import { getCupboardFootprint, getCupboardRotationDegrees } from "../../cupboards/model/geometry";
import { useCupboards } from "../../cupboards/state/CupboardProvider";
import {
  HEIGHT_OPTIONS_REFERENCE_NOTE,
  formatCustomisationSource,
  formatMillimeterTuple,
  formatModuleDimensions,
  formatModuleFamily,
  formatModuleHeightOptions,
  formatModuleWidthOptions,
  formatPrototypePrice,
  formatSelectionResizeHint,
  formatSelectionPosition,
} from "../lib/roomFormatting";

const PROJECT_DEFAULT_VALUE = "__project_default__";

const PriceBreakdownRow = ({ label, value, currency }) => (
  <div className="selection-breakdown__row">
    <span>{label}</span>
    <strong>{formatPrototypePrice(value, currency)}</strong>
  </div>
);

const CustomisationSelectField = ({ fieldLabel, source, projectLabel, value, options, onChange }) => (
  <section className="selection-config__section">
    <div className="selection-config__header">
      <div>
        <p className="selection-config__eyebrow">{fieldLabel}</p>
        <strong className="selection-config__status">{formatCustomisationSource(source)}</strong>
      </div>
    </div>

    <label className="selection-config__field">
      <span className="selection-config__field-label">Selection</span>
      <select className="selection-config__select" value={value ?? PROJECT_DEFAULT_VALUE} onChange={onChange}>
        <option value={PROJECT_DEFAULT_VALUE}>Use project default: {projectLabel}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  </section>
);

const SelectionInspectorPanel = () => {
  const {
    clearSelection,
    deleteSelectedCupboard,
    projectCustomisation,
    resetSelectedCupboardCustomisation,
    rotateSelectedCupboard,
    selectedCupboard,
    selectedCupboardResolvedCustomisation,
    selectedPricingLineItem,
    updateSelectedCupboardCustomisation,
  } = useCupboards();
  const isUnavailable = Boolean(selectedCupboard?.isUnavailable);
  const isCustomised = hasCupboardCustomisationOverrides(selectedCupboard);
  const rawCustomisation = cloneCupboardCustomisation(
    selectedCupboard?.customisation ?? createInheritedCupboardCustomisation(),
  );

  const selectedCupboardFootprint = selectedCupboard
    ? getCupboardFootprint(selectedCupboard.size, selectedCupboard.rotation)
    : null;
  const selectedRotationDegrees = selectedCupboard ? getCupboardRotationDegrees(selectedCupboard.rotation) : null;
  const selectedFootprintDimensionsMm = selectedCupboardFootprint
    ? [
        convertMetersToMillimeters(selectedCupboardFootprint.width),
        convertMetersToMillimeters(selectedCupboardFootprint.depth),
      ]
    : null;
  const supportedWidthsLabel = selectedCupboard ? formatModuleWidthOptions(selectedCupboard) : "";
  const supportedHeightsLabel = selectedCupboard ? formatModuleHeightOptions(selectedCupboard) : "";
  const compatibleCarcasses = selectedCupboard ? getCompatibleCarcassOptions(selectedCupboard) : [];
  const compatibleFacades = selectedCupboard ? getCompatibleFacadeOptions(selectedCupboard) : [];
  const compatibleHandles = selectedCupboard ? getCompatibleHandleOptions(selectedCupboard) : [];
  const compatibleAccessories = selectedCupboard ? getCompatibleAccessoryOptions(selectedCupboard) : [];
  const effectiveAccessoryIds = selectedCupboardResolvedCustomisation?.effectiveCustomisation.accessoryIds ?? [];
  const effectiveAccessoryLabels =
    selectedCupboardResolvedCustomisation?.options.accessories.map((option) => option.label) ?? [];
  const isAccessoryCustom = rawCustomisation.accessoryIds !== null;
  const selectedAccessoryIds = isAccessoryCustom ? rawCustomisation.accessoryIds ?? [] : effectiveAccessoryIds;

  const handleCustomisationChange = (field) => (event) => {
    const nextValue = event.target.value === PROJECT_DEFAULT_VALUE ? null : event.target.value;

    updateSelectedCupboardCustomisation({
      [field]: nextValue,
    });
  };

  const handleAccessoryCustomModeChange = (event) => {
    updateSelectedCupboardCustomisation({
      accessoryIds: event.target.checked ? effectiveAccessoryIds : null,
    });
  };

  const handleAccessoryToggle = (accessoryId) => (event) => {
    const currentIds = isAccessoryCustom ? rawCustomisation.accessoryIds ?? [] : effectiveAccessoryIds;
    const nextIds = event.target.checked
      ? [...new Set([...currentIds, accessoryId])]
      : currentIds.filter((currentAccessoryId) => currentAccessoryId !== accessoryId);

    updateSelectedCupboardCustomisation({
      accessoryIds: nextIds,
    });
  };

  return (
    <section className="panel-card">
      <div className="panel-card__header">
        <p className="panel-card__eyebrow">Cabinet Inspector</p>
        <h2 className="panel-card__title">Selected cabinet</h2>
      </div>

      {selectedCupboard ? (
        <div className="selection-panel">
          <div className="selection-panel__hero">
            <span className={`selection-panel__tag${isCustomised ? " selection-panel__tag--customized" : ""}`}>
              {isCustomised ? "Customized" : "Using project defaults"}
            </span>
            <strong className="selection-panel__name">{selectedCupboard.name}</strong>
            <p className="selection-panel__meta">
              {formatModuleFamily(selectedCupboard)} ·{" "}
              {isUnavailable
                ? "Live estimate unavailable"
                : formatPrototypePrice(selectedPricingLineItem?.totalPrice ?? 0, selectedPricingLineItem?.currency)}
            </p>
            <p className="selection-panel__copy">
              {isUnavailable
                ? "This cabinet came from an imported project, but its source module is no longer available in the current catalog. Delete it, then drag in a current catalog module to restore a clean live total."
                : `${formatSelectionResizeHint()} ${HEIGHT_OPTIONS_REFERENCE_NOTE}. Use the controls below to keep project defaults or create a cabinet-specific exception.`}
            </p>
          </div>

          {isUnavailable ? (
            <div className="selection-panel__warning">
              <strong>Imported snapshot reference</strong>
              <p>
                The current catalog cannot reprice this cabinet. The saved export-time reference price was{" "}
                {formatPrototypePrice(selectedCupboard.price, selectedCupboard.currency)}.
              </p>
            </div>
          ) : null}

          <div className="selection-details">
            <div className="selection-details__item">
              <span className="selection-details__label">Cabinet family</span>
              <strong className="selection-details__value">{formatModuleFamily(selectedCupboard)}</strong>
            </div>
            <div className="selection-details__item">
              <span className="selection-details__label">Active cabinet size</span>
              <strong className="selection-details__value">{formatModuleDimensions(selectedCupboard)}</strong>
            </div>
            <div className="selection-details__item">
              <span className="selection-details__label">Supported widths</span>
              <strong className="selection-details__value">{supportedWidthsLabel}</strong>
            </div>
            <div className="selection-details__item">
              <span className="selection-details__label">Supported heights</span>
              <strong className="selection-details__value">{supportedHeightsLabel}</strong>
            </div>
            <div className="selection-details__item">
              <span className="selection-details__label">Height editing</span>
              <strong className="selection-details__value">{HEIGHT_OPTIONS_REFERENCE_NOTE}</strong>
            </div>
            <div className="selection-details__item">
              <span className="selection-details__label">{isUnavailable ? "Live estimate" : "Line-item total"}</span>
              <strong className="selection-details__value">
                {isUnavailable
                  ? "Unavailable"
                  : formatPrototypePrice(selectedPricingLineItem?.totalPrice ?? 0, selectedPricingLineItem?.currency)}
              </strong>
            </div>
            {isUnavailable ? (
              <div className="selection-details__item">
                <span className="selection-details__label">Exported reference price</span>
                <strong className="selection-details__value">
                  {formatPrototypePrice(selectedCupboard.price, selectedCupboard.currency)}
                </strong>
              </div>
            ) : null}
            <div className="selection-details__item">
              <span className="selection-details__label">Current footprint</span>
              <strong className="selection-details__value">
                {selectedFootprintDimensionsMm ? formatMillimeterTuple(selectedFootprintDimensionsMm) : "N/A"}
              </strong>
            </div>
            <div className="selection-details__item">
              <span className="selection-details__label">Rotation</span>
              <strong className="selection-details__value">{selectedRotationDegrees}°</strong>
            </div>
            <div className="selection-details__item">
              <span className="selection-details__label">Scene position</span>
              <strong className="selection-details__value">{formatSelectionPosition(selectedCupboard.position)}</strong>
            </div>
          </div>

          {!isUnavailable ? (
            <div className="selection-config">
              {compatibleCarcasses.length > 1 ? (
                <CustomisationSelectField
                  fieldLabel="Inside body / carcass"
                  source={selectedCupboardResolvedCustomisation?.sources.carcass}
                  projectLabel={findCarcassOption(projectCustomisation.carcassId)?.label ?? "Project default"}
                  value={rawCustomisation.carcassId}
                  options={compatibleCarcasses}
                  onChange={handleCustomisationChange("carcassId")}
                />
              ) : null}

              <CustomisationSelectField
                fieldLabel="Facade"
                source={selectedCupboardResolvedCustomisation?.sources.facade}
                projectLabel={findFacadeOption(projectCustomisation.facadeId)?.label ?? "Project default"}
                value={rawCustomisation.facadeId}
                options={compatibleFacades}
                onChange={handleCustomisationChange("facadeId")}
              />

              <CustomisationSelectField
                fieldLabel="Handle"
                source={selectedCupboardResolvedCustomisation?.sources.handle}
                projectLabel={findHandleOption(projectCustomisation.handleId)?.label ?? "Project default"}
                value={rawCustomisation.handleId}
                options={compatibleHandles}
                onChange={handleCustomisationChange("handleId")}
              />

              <section className="selection-config__section">
                <div className="selection-config__header">
                  <div>
                    <p className="selection-config__eyebrow">Accessories</p>
                    <strong className="selection-config__status">
                      {formatCustomisationSource(selectedCupboardResolvedCustomisation?.sources.accessories)}
                    </strong>
                  </div>
                </div>

                <label className="selection-config__field">
                  <span className="selection-config__field-label">Preset</span>
                  <select
                    className="selection-config__select"
                    value={rawCustomisation.accessoryPresetId ?? PROJECT_DEFAULT_VALUE}
                    onChange={handleCustomisationChange("accessoryPresetId")}
                  >
                    <option value={PROJECT_DEFAULT_VALUE}>
                      Use project default:{" "}
                      {findAccessoryPresetOption(projectCustomisation.accessoryPresetId)?.label ?? "Project default"}
                    </option>
                    {starterAccessoryPresetCatalog.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="selection-config__checkbox">
                  <input type="checkbox" checked={isAccessoryCustom} onChange={handleAccessoryCustomModeChange} />
                  <span>Custom accessories</span>
                </label>

                {isAccessoryCustom ? (
                  compatibleAccessories.length > 0 ? (
                    <div className="selection-config__checkbox-list">
                      {compatibleAccessories.map((option) => (
                        <label key={option.id} className="selection-config__checkbox">
                          <input
                            type="checkbox"
                            checked={selectedAccessoryIds.includes(option.id)}
                            onChange={handleAccessoryToggle(option.id)}
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="selection-config__hint">No compatible accessory options for this cabinet size yet.</p>
                  )
                ) : (
                  <p className="selection-config__hint">
                    Preset result: {effectiveAccessoryLabels.length > 0 ? effectiveAccessoryLabels.join(", ") : "No accessories"}
                  </p>
                )}
              </section>

              <section className="selection-config__section">
                <div className="selection-config__header">
                  <div>
                    <p className="selection-config__eyebrow">Price breakdown</p>
                    <strong className="selection-config__status">Live estimate</strong>
                  </div>
                </div>

                <div className="selection-breakdown">
                  <PriceBreakdownRow
                    label="Body"
                    value={selectedPricingLineItem?.bodyPrice ?? 0}
                    currency={selectedPricingLineItem?.currency}
                  />
                  <PriceBreakdownRow
                    label="Carcass"
                    value={selectedPricingLineItem?.carcassPrice ?? 0}
                    currency={selectedPricingLineItem?.currency}
                  />
                  <PriceBreakdownRow
                    label="Facade"
                    value={selectedPricingLineItem?.facadePrice ?? 0}
                    currency={selectedPricingLineItem?.currency}
                  />
                  <PriceBreakdownRow
                    label="Handle"
                    value={selectedPricingLineItem?.handlePrice ?? 0}
                    currency={selectedPricingLineItem?.currency}
                  />
                  <PriceBreakdownRow
                    label="Accessories"
                    value={selectedPricingLineItem?.accessoriesPrice ?? 0}
                    currency={selectedPricingLineItem?.currency}
                  />
                  <div className="selection-breakdown__row selection-breakdown__row--total">
                    <span>Total</span>
                    <strong>
                      {formatPrototypePrice(selectedPricingLineItem?.totalPrice ?? 0, selectedPricingLineItem?.currency)}
                    </strong>
                  </div>
                </div>
              </section>
            </div>
          ) : null}

          {isCustomised && !isUnavailable ? (
            <Button
              type="button"
              variant="outlined"
              onClick={resetSelectedCupboardCustomisation}
              className="planner-button planner-button--secondary selection-panel__reset"
            >
              Reset to project defaults
            </Button>
          ) : null}

          <div className="selection-actions">
            <Button
              type="button"
              variant="contained"
              onClick={rotateSelectedCupboard}
              className="planner-button planner-button--primary"
            >
              Rotate 90°
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={deleteSelectedCupboard}
              className="planner-button planner-button--danger"
            >
              Delete
            </Button>
          </div>

          <Button type="button" variant="text" onClick={clearSelection} className="selection-panel__clear">
            Clear selection
          </Button>
        </div>
      ) : (
        <div className="empty-state">
          <strong className="empty-state__title">Nothing selected yet</strong>
          <p className="empty-state__copy">
            Click a cabinet in the 3D room to inspect it here, then keep project defaults, create a custom exception,
            drag its side handles to resize it, drag the cabinet body along its wall, rotate it 90 degrees, or delete it
            from the layout.
          </p>
        </div>
      )}
    </section>
  );
};

export default SelectionInspectorPanel;
