"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { motion } from "motion/react";
import { useId } from "react";
function HighlightSegment({
  pathRef,
  visible,
  stroke,
  strokeWidth,
  height,
  x,
  width
}) {
  const clipId = useId();
  if (!(visible && pathRef.current)) {
    return null;
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("clipPath", { id: clipId, children: /* @__PURE__ */ jsx(motion.rect, { height, width, x, y: 0 }) }) }),
    /* @__PURE__ */ jsx(
      motion.path,
      {
        animate: { opacity: 1 },
        clipPath: `url(#${clipId})`,
        d: pathRef.current.getAttribute("d") || "",
        exit: { opacity: 0 },
        fill: "none",
        initial: { opacity: 0 },
        stroke,
        strokeLinecap: "round",
        strokeWidth,
        transition: { duration: 0.4, ease: "easeInOut" }
      }
    )
  ] });
}
HighlightSegment.displayName = "HighlightSegment";
var stdin_default = HighlightSegment;
export {
  HighlightSegment,
  stdin_default as default
};
