import React from "react";
import { Button } from "@mui/material";

import { starterCabinetCatalog } from "../../cupboards/model/catalog";
import { useCupboards } from "../../cupboards/state/CupboardProvider";
import { formatMillimeterTuple } from "../lib/roomFormatting";

const CabinetCatalogPanel = () => {
  const { addCupboard } = useCupboards();

  return (
    <section className="panel-card panel-card--secondary">
      <div className="panel-card__header">
        <p className="panel-card__eyebrow">Starter Catalog</p>
        <h2 className="panel-card__title">Add a cabinet</h2>
      </div>
      <p className="panel-card__copy">
        New cabinets snap into a predictable run along the back wall and become selected immediately so you can edit
        them without an extra click.
      </p>

      <div className="catalog-list">
        {starterCabinetCatalog.map((cabinet) => (
          <article className="catalog-card" key={cabinet.id}>
            <div className="catalog-card__content">
              <strong className="catalog-card__title">{cabinet.name}</strong>
              <span className="catalog-card__size">{formatMillimeterTuple(cabinet.dimensionsMm)}</span>
              <p className="catalog-card__copy">{cabinet.description}</p>
            </div>

            <Button
              variant="outlined"
              onClick={() => addCupboard(cabinet.id)}
              className="planner-button planner-button--secondary"
            >
              Add
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
};

export default CabinetCatalogPanel;
