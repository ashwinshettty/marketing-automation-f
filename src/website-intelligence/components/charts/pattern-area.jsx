"use client";
import { jsx } from "react/jsx-runtime";
import { curveMonotoneX } from "@visx/curve";
import { AreaClosed } from "@visx/shape";
import { useChartStable } from "./chart-context";
function PatternArea({
  dataKey,
  fill,
  curve = curveMonotoneX
}) {
  const { renderData, xScale, yScale, xAccessor } = useChartStable();
  return /* @__PURE__ */ jsx(
    AreaClosed,
    {
      curve,
      data: renderData,
      fill,
      x: (d) => xScale(xAccessor(d)) ?? 0,
      y: (d) => {
        const v = d[dataKey];
        return typeof v === "number" ? yScale(v) ?? 0 : 0;
      },
      yScale
    }
  );
}
PatternArea.displayName = "PatternArea";
var stdin_default = PatternArea;
export {
  PatternArea,
  stdin_default as default
};
