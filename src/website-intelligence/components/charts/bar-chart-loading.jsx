"use client";
import { jsx } from "react/jsx-runtime";
import { BarChart } from "./bar-chart";
const EMPTY_DATA = [];
function BarChartLoading({
  margin,
  aspectRatio = "2 / 1",
  className = ""
}) {
  return /* @__PURE__ */ jsx(
    BarChart,
    {
      aspectRatio,
      className,
      data: EMPTY_DATA,
      margin,
      status: "loading"
    }
  );
}
var stdin_default = BarChartLoading;
export {
  BarChartLoading,
  stdin_default as default
};
