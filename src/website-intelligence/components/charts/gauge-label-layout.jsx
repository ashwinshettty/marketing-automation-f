"use client";
import { jsx, jsxs } from "react/jsx-runtime";
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
const labelAlignClass = {
  start: "items-start text-left",
  center: "items-center text-center",
  end: "items-end text-right"
};
function GaugeLabelShell({
  centerValue,
  defaultLabel = "Total",
  prefix,
  suffix,
  formatOptions = defaultChartStatFlowFormat,
  align = "center",
  className
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        chartCenterContainerClassName,
        "flex min-w-0 flex-col",
        labelAlignClass[align],
        className
      ),
      children: /* @__PURE__ */ jsx(
        ChartStatFlow,
        {
          formatOptions,
          label: defaultLabel,
          labelClassName: cn(
            chartCenterLabelClassName,
            "text-[length:var(--chart-foreground-muted)]"
          ),
          prefix,
          suffix,
          value: centerValue,
          valueClassName: cn(
            chartCenterValueClassName,
            "text-[length:var(--chart-foreground)]"
          )
        }
      )
    }
  );
}
const crossAxisSelf = {
  start: "self-start",
  center: "self-center",
  end: "self-end"
};
const crossAxisAlign = {
  start: "items-start",
  center: "items-center",
  end: "items-end"
};
const inlineAxisAlign = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end"
};
function GaugeLabelLayout({
  placement,
  align,
  label,
  children,
  className
}) {
  if (!label) {
    return /* @__PURE__ */ jsx("div", { className: cn("w-full min-w-0", className), children });
  }
  if (placement === "top") {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn(
          "flex w-full min-w-0 flex-col gap-3",
          crossAxisAlign[align],
          className
        ),
        children: [
          /* @__PURE__ */ jsx("div", { className: crossAxisSelf[align], children: label }),
          /* @__PURE__ */ jsx("div", { className: "w-full min-w-0", children })
        ]
      }
    );
  }
  if (placement === "bottom") {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn(
          "flex w-full min-w-0 flex-col gap-3",
          crossAxisAlign[align],
          className
        ),
        children: [
          /* @__PURE__ */ jsx("div", { className: "w-full min-w-0", children }),
          /* @__PURE__ */ jsx("div", { className: crossAxisSelf[align], children: label })
        ]
      }
    );
  }
  if (placement === "left") {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn(
          "flex w-full min-w-0 items-center gap-4",
          inlineAxisAlign[align],
          className
        ),
        children: [
          /* @__PURE__ */ jsx("div", { className: "shrink-0", children: label }),
          /* @__PURE__ */ jsx("div", { className: "min-w-0 flex-1", children })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "flex w-full min-w-0 items-center gap-4",
        inlineAxisAlign[align],
        className
      ),
      children: [
        /* @__PURE__ */ jsx("div", { className: "min-w-0 flex-1", children }),
        /* @__PURE__ */ jsx("div", { className: "shrink-0", children: label })
      ]
    }
  );
}
export {
  GaugeLabelLayout,
  GaugeLabelShell
};
