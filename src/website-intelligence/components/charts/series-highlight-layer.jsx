"use client";
import { jsx } from "react/jsx-runtime";
import { useChartStable } from "./chart-context";
import { HighlightSegment } from "./highlight-segment";
import { useHighlightSegment } from "./use-highlight-segment";
function SeriesHighlightLayer({
  enabled,
  height,
  pathRef,
  stroke,
  strokeWidth
}) {
  const { isLoaded } = useChartStable();
  const { xSpring, widthSpring, isActive } = useHighlightSegment({ enabled });
  return /* @__PURE__ */ jsx(
    HighlightSegment,
    {
      height,
      pathRef,
      stroke,
      strokeWidth,
      visible: enabled && isActive && isLoaded,
      width: widthSpring,
      x: xSpring
    }
  );
}
SeriesHighlightLayer.displayName = "SeriesHighlightLayer";
var stdin_default = SeriesHighlightLayer;
export {
  SeriesHighlightLayer,
  stdin_default as default
};
