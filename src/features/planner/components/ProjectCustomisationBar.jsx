import React from "react";

import {
  starterAccessoryPresetCatalog,
  starterCarcassCatalog,
  starterFacadeCatalog,
  starterHandleCatalog,
} from "../../cupboards/model/customizationCatalog";
import { useCupboards } from "../../cupboards/state/CupboardProvider";
import { formatPrototypePrice } from "../lib/roomFormatting";

const ProjectCustomisationBar = () => {
  const {
    inheritedCupboardCount = 0,
    pricingSummary,
    projectCustomisation,
    updateProjectCustomisation,
  } = useCupboards();
  const totalPriceLabel = formatPrototypePrice(pricingSummary?.totalPrice ?? 0, pricingSummary?.currency ?? "USD");
  const inheritanceMessage =
    (pricingSummary?.objectCount ?? 0) === 0
      ? "New cabinets will inherit these defaults as you place them."
      : `Applies live to ${inheritedCupboardCount} inheriting cabinet${
          inheritedCupboardCount === 1 ? "" : "s"
        }.`;

  return (
    <section className="project-customisation-bar">
      <div className="project-customisation-bar__copy">
        <p className="project-customisation-bar__eyebrow">Project Defaults</p>
        <strong className="project-customisation-bar__title">Set finishes once, then place and customise exceptions.</strong>
        <p className="project-customisation-bar__description">{inheritanceMessage}</p>
      </div>

      <div className="project-customisation-bar__controls">
        {starterCarcassCatalog.length > 1 ? (
          <label className="project-customisation-bar__field">
            <span className="project-customisation-bar__label">Inside body / carcass</span>
            <select
              className="project-customisation-bar__select"
              value={projectCustomisation.carcassId}
              onChange={(event) => updateProjectCustomisation({ carcassId: event.target.value })}
            >
              {starterCarcassCatalog.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="project-customisation-bar__field">
          <span className="project-customisation-bar__label">Facade</span>
          <select
            className="project-customisation-bar__select"
            value={projectCustomisation.facadeId}
            onChange={(event) => updateProjectCustomisation({ facadeId: event.target.value })}
          >
            {starterFacadeCatalog.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="project-customisation-bar__field">
          <span className="project-customisation-bar__label">Handle</span>
          <select
            className="project-customisation-bar__select"
            value={projectCustomisation.handleId}
            onChange={(event) => updateProjectCustomisation({ handleId: event.target.value })}
          >
            {starterHandleCatalog.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="project-customisation-bar__field">
          <span className="project-customisation-bar__label">Accessory preset</span>
          <select
            className="project-customisation-bar__select"
            value={projectCustomisation.accessoryPresetId}
            onChange={(event) => updateProjectCustomisation({ accessoryPresetId: event.target.value })}
          >
            {starterAccessoryPresetCatalog.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="project-customisation-bar__summary" aria-label="Live estimate">
        <span className="project-customisation-bar__summary-label">Live estimate</span>
        <strong className="project-customisation-bar__summary-value">{totalPriceLabel}</strong>
      </div>
    </section>
  );
};

export default ProjectCustomisationBar;
