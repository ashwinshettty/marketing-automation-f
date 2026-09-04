"use client";
import { jsx } from "react/jsx-runtime";
import { PatternCircles, PatternLines } from "./visx-pattern";
const PATTERN_PRESET_IDS = [
  "none",
  "diagonal",
  "horizontal",
  "vertical",
  "cross",
  "dots",
  "circles",
  "accent"
];
function isCirclePattern(preset) {
  return preset === "circles" || preset === "dots";
}
function isCirclesPattern(preset) {
  return isCirclePattern(preset);
}
function patternPresetTileSize(preset, scale = 1) {
  let base = { width: 6, height: 6, strokeWidth: 1 };
  if (preset === "dots") {
    base = { width: 10, height: 10, strokeWidth: 0 };
  } else if (preset === "cross") {
    base = { width: 8, height: 8, strokeWidth: 1 };
  } else if (preset === "circles") {
    base = { width: 6, height: 6, strokeWidth: 1 };
  }
  return {
    width: base.width * scale,
    height: base.height * scale,
    strokeWidth: base.strokeWidth * scale
  };
}
function renderPatternCircles(preset, _id, color, common, options, scale) {
  const isDotGrid = preset === "dots";
  const radius = options.radius ?? (isDotGrid ? Math.max(0.5, 1.5 * scale) : 2 * scale);
  const dotFillEnabled = options.dotFill !== false;
  if (isDotGrid) {
    const dotFill = dotFillEnabled ? options.fill || color : void 0;
    return /* @__PURE__ */ jsx(
      PatternCircles,
      {
        ...common,
        complement: options.complement,
        fill: dotFill,
        radius,
        stroke: dotFillEnabled && options.fill ? void 0 : color,
        strokeWidth: dotFillEnabled && !options.fill ? options.strokeWidth ?? 0 : options.strokeWidth ?? 1
      }
    );
  }
  return /* @__PURE__ */ jsx(
    PatternCircles,
    {
      ...common,
      complement: options.complement,
      fill: options.fill || void 0,
      radius,
      stroke: color,
      strokeWidth: options.strokeWidth ?? common.strokeWidth
    }
  );
}
function renderPatternPreset(preset, id, options = {}) {
  if (preset === "none") {
    return null;
  }
  const color = options.color ?? "var(--chart-1)";
  const scale = options.scale ?? 1;
  const tile = patternPresetTileSize(preset, scale);
  const common = {
    id,
    height: tile.height,
    width: tile.width,
    strokeWidth: tile.strokeWidth,
    ...options.tileBackground ? { background: options.tileBackground } : {}
  };
  if (preset === "dots" || preset === "circles") {
    return renderPatternCircles(preset, id, color, common, options, scale);
  }
  const strokeWidth = options.strokeWidth ?? tile.strokeWidth;
  switch (preset) {
    case "diagonal":
      return /* @__PURE__ */ jsx(
        PatternLines,
        {
          ...common,
          orientation: ["diagonal"],
          stroke: color,
          strokeWidth
        }
      );
    case "horizontal":
      return /* @__PURE__ */ jsx(
        PatternLines,
        {
          ...common,
          orientation: ["horizontal"],
          stroke: color,
          strokeWidth
        }
      );
    case "vertical":
      return /* @__PURE__ */ jsx(
        PatternLines,
        {
          ...common,
          orientation: ["vertical"],
          stroke: color,
          strokeWidth
        }
      );
    case "cross":
      return /* @__PURE__ */ jsx(
        PatternLines,
        {
          ...common,
          orientation: ["diagonal", "diagonalRightToLeft"],
          stroke: color,
          strokeWidth
        }
      );
    case "accent":
      return /* @__PURE__ */ jsx(
        PatternLines,
        {
          ...common,
          orientation: ["diagonal"],
          stroke: "#e879f9",
          strokeWidth
        }
      );
    default:
      return null;
  }
}
export {
  PATTERN_PRESET_IDS,
  isCirclePattern,
  isCirclesPattern,
  patternPresetTileSize,
  renderPatternPreset
};
