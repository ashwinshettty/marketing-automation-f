"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { intFmt } from "../chart-formatters";
function TooltipContent({ title, rows, children }) {
  return /* @__PURE__ */ jsx("div", { className: "overflow-hidden", children: /* @__PURE__ */ jsxs("div", { className: "px-3 py-2.5", children: [
    title && /* @__PURE__ */ jsx("div", { className: "mb-2 text-left font-medium text-chart-tooltip-foreground text-xs", children: title }),
    /* @__PURE__ */ jsx("div", { className: "space-y-1.5", children: rows.map((row) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "flex items-center justify-between gap-4",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: "h-2.5 w-2.5 shrink-0 rounded-full",
                style: { backgroundColor: row.color }
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-chart-tooltip-muted text-sm", children: row.label })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-medium text-chart-tooltip-foreground text-sm tabular-nums", children: typeof row.value === "number" ? intFmt(row.value) : row.value })
        ]
      },
      `${row.label}-${row.color}`
    )) }),
    children && /* @__PURE__ */ jsx("div", { className: "mt-2 transition-opacity duration-200 ease-out", children })
  ] }) });
}
TooltipContent.displayName = "TooltipContent";
var stdin_default = TooltipContent;
export {
  TooltipContent,
  stdin_default as default
};
