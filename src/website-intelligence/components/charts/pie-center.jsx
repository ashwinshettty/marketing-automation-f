"use client";
import { jsx } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
import {
  chartCenterContainerClassName,
  chartCenterLabelClassName,
  chartCenterValueClassName
} from "./chart-center-typography";
import {
  ChartStatFlow,
  defaultChartStatFlowFormat
} from "./chart-stat-flow";
import { usePieHover, usePieStable } from "./pie-context";
function PieCenter({
  defaultLabel = "Total",
  formatOptions = defaultChartStatFlowFormat,
  children,
  className = "",
  valueClassName = chartCenterValueClassName,
  labelClassName = chartCenterLabelClassName,
  prefix,
  suffix
}) {
  const { data, totalValue, innerRadius, geometryScrubbing } = usePieStable();
  const { hoveredIndex } = usePieHover();
  const effectiveHoveredIndex = geometryScrubbing ? null : hoveredIndex;
  const hoveredData = effectiveHoveredIndex === null ? null : data[effectiveHoveredIndex];
  const displayValue = hoveredData ? hoveredData.value : totalValue;
  const displayLabel = hoveredData ? hoveredData.label : defaultLabel;
  const centerSize = innerRadius * 2 - 16;
  if (innerRadius <= 0) {
    return null;
  }
  if (children && hoveredData) {
    return /* @__PURE__ */ jsx(
      "div",
      {
        className: cn(
          chartCenterContainerClassName,
          "flex items-center justify-center",
          className
        ),
        style: { width: centerSize, height: centerSize },
        children: children({
          value: displayValue,
          label: displayLabel,
          isHovered: effectiveHoveredIndex !== null,
          data: hoveredData
        })
      }
    );
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        chartCenterContainerClassName,
        "flex flex-col items-center justify-center text-center",
        className
      ),
      style: { width: centerSize, height: centerSize },
      children: /* @__PURE__ */ jsx(
        ChartStatFlow,
        {
          formatOptions,
          label: displayLabel,
          labelClassName,
          prefix,
          suffix,
          value: displayValue,
          valueClassName
        }
      )
    }
  );
}
PieCenter.displayName = "PieCenter";
var stdin_default = PieCenter;
export {
  PieCenter,
  stdin_default as default
};
