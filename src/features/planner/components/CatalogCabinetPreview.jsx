import React from "react";
import { Canvas } from "@react-three/fiber";

import KitchenCabinetModel from "../../cupboards/components/KitchenCabinetModel";

const canRenderPreviewCanvas = () => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  if (typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent ?? "")) {
    return false;
  }

  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch (error) {
    return false;
  }
};

const PREVIEW_CANVAS_ENABLED = canRenderPreviewCanvas();

const getPreviewScale = (size) => {
  const maxDimension = Math.max(...(size ?? []).filter((value) => Number.isFinite(value)), 0);

  return maxDimension > 0 ? 0.95 / maxDimension : 1;
};

const CatalogCabinetPreview = ({ size, category, model }) => {
  if (!PREVIEW_CANVAS_ENABLED) {
    return <div className="catalog-cabinet-preview__fallback" aria-hidden="true" />;
  }

  return (
    <div className="catalog-cabinet-preview__canvas" aria-hidden="true">
      <Canvas
        frameloop="demand"
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0, 2.6], fov: 28 }}
      >
        <ambientLight intensity={1.35} />
        <directionalLight position={[2.5, 3.5, 4]} intensity={1.1} />
        <directionalLight position={[-2, 1.5, 2]} intensity={0.55} />
        <group rotation={[0.2, -0.65, 0]} scale={getPreviewScale(size)}>
          <KitchenCabinetModel size={size} category={category} model={model} />
        </group>
      </Canvas>
    </div>
  );
};

export default CatalogCabinetPreview;
