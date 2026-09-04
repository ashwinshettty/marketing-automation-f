"use client";
import { jsx } from "react/jsx-runtime";
import { motion } from "motion/react";
import { clipRevealTransition } from "./animation";
function ChartRevealClip({
  clipPathId,
  height,
  targetWidth,
  enterTransition,
  revealEpoch,
  padding = 0,
  animating = true,
  mode = "reveal",
  onComplete
}) {
  const transition = clipRevealTransition(enterTransition);
  const paddedWidth = Math.max(0, targetWidth + padding * 2);
  const paddedHeight = height + padding * 2;
  if (!animating) {
    return /* @__PURE__ */ jsx("clipPath", { id: clipPathId, children: /* @__PURE__ */ jsx(
      "rect",
      {
        height: paddedHeight,
        width: paddedWidth,
        x: -padding,
        y: -padding
      }
    ) });
  }
  if (mode === "conceal") {
    const rightEdge = -padding + paddedWidth;
    return /* @__PURE__ */ jsx("clipPath", { id: clipPathId, children: /* @__PURE__ */ jsx(
      motion.rect,
      {
        animate: { width: 0, x: rightEdge },
        height: paddedHeight,
        initial: { width: paddedWidth, x: -padding },
        onAnimationComplete: () => onComplete?.(),
        transition,
        y: -padding
      },
      `conceal-${revealEpoch}`
    ) });
  }
  return /* @__PURE__ */ jsx("clipPath", { id: clipPathId, children: /* @__PURE__ */ jsx(
    motion.rect,
    {
      animate: { width: paddedWidth },
      height: paddedHeight,
      initial: { width: 0 },
      transition,
      width: paddedWidth,
      x: -padding,
      y: -padding
    },
    `reveal-${revealEpoch}`
  ) });
}
export {
  ChartRevealClip
};
