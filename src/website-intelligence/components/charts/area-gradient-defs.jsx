import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import {
  fadeGradientStops,
  resolveFadeSides,
  viewportFadeGradientAttrs
} from "./fade-edges";
function AreaGradientDefs({
  gradientId,
  strokeGradientId,
  edgeMaskId,
  edgeGradientId,
  fill,
  fillOpacity,
  gradientToOpacity,
  gradientSpan = 1,
  resolvedStroke,
  isPatternFill,
  fadeEdges,
  innerWidth,
  innerHeight
}) {
  const sides = resolveFadeSides(fadeEdges);
  const strokeStops = sides.any ? fadeGradientStops(sides) : null;
  const showEdgeMask = sides.any && !isPatternFill;
  const edgeStops = showEdgeMask ? fadeGradientStops(sides) : null;
  const span = Math.min(1, Math.max(0.01, gradientSpan));
  const midOffset = `${span * 100}%`;
  return /* @__PURE__ */ jsxs("defs", { children: [
    isPatternFill ? null : /* @__PURE__ */ jsxs("linearGradient", { id: gradientId, x1: "0%", x2: "0%", y1: "0%", y2: "100%", children: [
      /* @__PURE__ */ jsx(
        "stop",
        {
          offset: "0%",
          style: { stopColor: fill, stopOpacity: fillOpacity }
        }
      ),
      /* @__PURE__ */ jsx(
        "stop",
        {
          offset: midOffset,
          style: { stopColor: fill, stopOpacity: gradientToOpacity }
        }
      ),
      span < 1 ? /* @__PURE__ */ jsx(
        "stop",
        {
          offset: "100%",
          style: { stopColor: fill, stopOpacity: gradientToOpacity }
        }
      ) : null
    ] }),
    strokeStops ? /* @__PURE__ */ jsx(
      "linearGradient",
      {
        id: strokeGradientId,
        ...viewportFadeGradientAttrs(innerWidth),
        children: strokeStops.map((stop) => /* @__PURE__ */ jsx(
          "stop",
          {
            offset: stop.offset,
            style: { stopColor: resolvedStroke, stopOpacity: stop.opacity }
          },
          stop.offset
        ))
      }
    ) : null,
    edgeStops ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        "linearGradient",
        {
          id: edgeGradientId,
          ...viewportFadeGradientAttrs(innerWidth),
          children: edgeStops.map((stop) => /* @__PURE__ */ jsx(
            "stop",
            {
              offset: stop.offset,
              style: { stopColor: "white", stopOpacity: stop.opacity }
            },
            stop.offset
          ))
        }
      ),
      /* @__PURE__ */ jsx("mask", { id: edgeMaskId, children: /* @__PURE__ */ jsx(
        "rect",
        {
          fill: `url(#${edgeGradientId})`,
          height: innerHeight,
          width: innerWidth,
          x: "0",
          y: "0"
        }
      ) })
    ] }) : null
  ] });
}
export {
  AreaGradientDefs
};
