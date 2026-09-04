"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import NumberFlow from "@number-flow/react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
const defaultChartStatFlowFormat = {
  notation: "standard",
  maximumFractionDigits: 0
};
function formatStatValue(value, formatOptions, prefix, suffix) {
  const formatted = new Intl.NumberFormat(void 0, formatOptions).format(
    value
  );
  return `${prefix ?? ""}${formatted}${suffix ?? ""}`;
}
function useNumberFlowElementReady() {
  const [ready, setReady] = useState(
    () => typeof customElements !== "undefined" && Boolean(customElements.get("number-flow-react"))
  );
  useEffect(() => {
    if (ready) {
      return;
    }
    let cancelled = false;
    customElements.whenDefined("number-flow-react").then(() => {
      if (!cancelled) {
        setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [ready]);
  return ready;
}
function ChartStatFlow({
  value,
  label,
  formatOptions = defaultChartStatFlowFormat,
  prefix,
  suffix,
  valueClassName = "text-2xl font-bold",
  labelClassName = "text-xs",
  icon
}) {
  const numberFlowReady = useNumberFlowElementReady();
  const staticValue = useMemo(
    () => formatStatValue(value, formatOptions, prefix, suffix),
    [value, formatOptions, prefix, suffix]
  );
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    icon ? /* @__PURE__ */ jsx("div", { className: "mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50", children: icon }) : null,
    /* @__PURE__ */ jsx("span", { className: cn("text-foreground tabular-nums", valueClassName), children: numberFlowReady ? /* @__PURE__ */ jsx(
      NumberFlow,
      {
        format: formatOptions,
        isolate: true,
        prefix,
        suffix,
        value,
        willChange: true
      }
    ) : staticValue }),
    /* @__PURE__ */ jsx("span", { className: cn("mt-0.5 text-chart-label", labelClassName), children: label })
  ] });
}
ChartStatFlow.displayName = "ChartStatFlow";
export {
  ChartStatFlow,
  defaultChartStatFlowFormat
};
