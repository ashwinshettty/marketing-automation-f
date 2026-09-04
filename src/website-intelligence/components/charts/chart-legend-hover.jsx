"use client";
import { jsx } from "react/jsx-runtime";
import { createContext, useContext, useMemo } from "react";
const ChartLegendHoverContext = createContext(null);
function ChartLegendHoverProvider({
  hoveredIndex,
  onHoverChange,
  children
}) {
  const value = useMemo(
    () => ({ hoveredIndex, setHoveredIndex: onHoverChange }),
    [hoveredIndex, onHoverChange]
  );
  return /* @__PURE__ */ jsx(ChartLegendHoverContext.Provider, { value, children });
}
function useChartLegendHover() {
  const context = useContext(ChartLegendHoverContext);
  return context ?? {
    hoveredIndex: null,
    setHoveredIndex: () => {
    }
  };
}
export {
  ChartLegendHoverProvider,
  useChartLegendHover
};
