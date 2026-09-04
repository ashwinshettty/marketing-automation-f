"use client";
import { jsx } from "react/jsx-runtime";
import { createContext, useContext } from "react";
const StaticChartPreviewContext = createContext(false);
function StaticChartPreviewProvider({
  children
}) {
  return /* @__PURE__ */ jsx(StaticChartPreviewContext.Provider, { value: true, children });
}
function useStaticChartPreview() {
  return useContext(StaticChartPreviewContext);
}
export {
  StaticChartPreviewProvider,
  useStaticChartPreview
};
