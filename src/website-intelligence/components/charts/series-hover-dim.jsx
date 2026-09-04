"use client";
import { jsx } from "react/jsx-runtime";
import { motion } from "motion/react";
import { useChartHover } from "./chart-context";
import { useChartLegendHover } from "./chart-legend-hover";
function SeriesHoverDim({
  enabled = true,
  dimOpacity = 0.5,
  durationSec = 0.4,
  seriesIndex,
  children
}) {
  const { tooltipData, selection } = useChartHover();
  const { hoveredIndex: legendHoveredIndex } = useChartLegendHover();
  const isChartHovering = tooltipData !== null || selection?.active === true;
  const isLegendDimmed = legendHoveredIndex !== null && seriesIndex !== void 0 && legendHoveredIndex !== seriesIndex;
  const opacity = enabled && (isChartHovering || isLegendDimmed) ? dimOpacity : 1;
  return /* @__PURE__ */ jsx(
    motion.g,
    {
      animate: { opacity },
      initial: { opacity: 1 },
      transition: { duration: durationSec, ease: "easeInOut" },
      children
    }
  );
}
SeriesHoverDim.displayName = "SeriesHoverDim";
var stdin_default = SeriesHoverDim;
export {
  SeriesHoverDim,
  stdin_default as default
};
