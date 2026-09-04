"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
const LabeledProgressIndicator = ({
  labels,
  progress = "0%",
  intervalMs = 2e3,
  activeLabel,
  indeterminate = false,
  className
}) => {
  const [labelIndex, setLabelIndex] = useState(0);
  const controlled = Boolean(activeLabel);
  const displayLabel = activeLabel || labels[labelIndex] || labels[0] || "";
  useEffect(() => {
    if (controlled || labels.length <= 1) return void 0;
    const interval = setInterval(() => {
      setLabelIndex((prev) => (prev + 1) % labels.length);
    }, intervalMs);
    return () => clearInterval(interval);
  }, [controlled, labels.length, intervalMs]);
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col items-center gap-5", className), children: [
    /* @__PURE__ */ jsx("div", { className: "relative flex w-full items-center justify-center perspective-[800px] transform-3d", children: /* @__PURE__ */ jsx(AnimatePresence, { mode: "popLayout", children: /* @__PURE__ */ jsx(
      motion.span,
      {
        initial: {
          opacity: 0,
          y: 10,
          scale: 1.4,
          filter: "blur(4px)",
          rotateX: -60
        },
        animate: {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          rotateX: 0
        },
        exit: {
          opacity: 0,
          filter: "blur(4px)",
          rotateX: 90,
          scale: 0.9
        },
        transition: {
          type: "spring",
          stiffness: 600,
          damping: 100,
          mass: 4
        },
        className: "flex w-full origin-bottom items-center justify-center text-center text-2xl font-semibold tracking-tight text-muted-foreground will-change-transform transform-3d sm:text-3xl",
        children: displayLabel
      },
      displayLabel
    ) }) }),
    /* @__PURE__ */ jsx("div", { className: "h-3.5 w-full max-w-[320px] overflow-hidden rounded-full border border-border bg-muted shadow-inner", children: indeterminate ? /* @__PURE__ */ jsx(
      motion.div,
      {
        className: "h-full w-1/3 rounded-full bg-brand-dark",
        animate: { x: ["-10%", "220%"] },
        transition: { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
      }
    ) : /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { width: "0%" },
        animate: { width: progress },
        transition: { duration: 0.6, ease: "easeOut" },
        className: "relative h-full overflow-hidden rounded-full bg-brand-dark",
        children: /* @__PURE__ */ jsx(
          motion.div,
          {
            initial: { x: "-100%" },
            animate: { x: "200%" },
            transition: {
              duration: Math.max(1.2, intervalMs / 1e3),
              repeat: Infinity,
              ease: "linear"
            },
            className: "absolute inset-y-0 w-full bg-linear-to-r from-transparent via-brand/40 to-transparent"
          }
        )
      }
    ) })
  ] });
};
export {
  LabeledProgressIndicator
};
