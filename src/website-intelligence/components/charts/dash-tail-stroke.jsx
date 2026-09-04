"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useId } from "react";
function DashTailStroke({
  pathD,
  pathLength,
  dashStartLength,
  dashStartX,
  innerWidth,
  innerHeight,
  stroke,
  strokeWidth,
  dashArray
}) {
  const clipPathId = useId().replace(/:/g, "");
  if (!pathD || pathLength <= 0 || dashStartLength >= pathLength) {
    return null;
  }
  const pad = strokeWidth * 2;
  const tailWidth = Math.max(0, innerWidth - dashStartX + pad);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("clipPath", { id: clipPathId, children: /* @__PURE__ */ jsx(
      "rect",
      {
        height: innerHeight + pad,
        width: tailWidth,
        x: dashStartX - strokeWidth,
        y: -strokeWidth
      }
    ) }) }),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: pathD,
        fill: "none",
        stroke,
        strokeDasharray: `${dashStartLength} ${Math.max(1, pathLength - dashStartLength)}`,
        strokeLinecap: "round",
        strokeWidth
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        clipPath: `url(#${clipPathId})`,
        d: pathD,
        fill: "none",
        stroke,
        strokeDasharray: dashArray,
        strokeLinecap: "round",
        strokeWidth
      }
    )
  ] });
}
export {
  DashTailStroke
};
