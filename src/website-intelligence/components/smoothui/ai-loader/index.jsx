"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
import { motion, useAnimationFrame, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
const AI_LOADER_CYCLE_SECONDS = 1.2;
const DOT_COUNT = 3;
const GRID_SIZE = 3;
const GRID_CELLS = GRID_SIZE * GRID_SIZE;
const GRID_DELAYS = [0, 1, 2, 1, 2, 3, 2, 3, 4];
const EASE_IN_OUT = [0.645, 0.045, 0.355, 1];
const MS_PER_SECOND = 1e3;
const ELAPSED_DECIMALS = 1;
const Dots = ({ reduced }) => /* @__PURE__ */ jsx("span", { className: "flex items-center gap-1", children: Array.from({ length: DOT_COUNT }, (_, index) => /* @__PURE__ */ jsx(
  motion.span,
  {
    animate: reduced ? { opacity: 0.5 } : { opacity: [0.25, 1, 0.25] },
    className: "size-1.5 rounded-full bg-current",
    transition: reduced ? { duration: 0 } : {
      delay: index * AI_LOADER_CYCLE_SECONDS / (DOT_COUNT * 2),
      duration: AI_LOADER_CYCLE_SECONDS,
      ease: EASE_IN_OUT,
      repeat: Number.POSITIVE_INFINITY
    }
  },
  index
)) });
const Bar = ({ reduced }) => /* @__PURE__ */ jsx("span", { className: "relative block h-1 w-24 overflow-hidden rounded-full bg-current/15", children: /* @__PURE__ */ jsx(
  motion.span,
  {
    animate: reduced ? { x: "0%" } : { x: ["-100%", "200%"] },
    className: "absolute inset-y-0 w-1/3 rounded-full bg-current",
    transition: reduced ? { duration: 0 } : {
      duration: AI_LOADER_CYCLE_SECONDS * 1.4,
      ease: EASE_IN_OUT,
      repeat: Number.POSITIVE_INFINITY
    }
  }
) });
const Grid = ({ reduced }) => /* @__PURE__ */ jsx("span", { className: "grid grid-cols-3 gap-0.5", children: Array.from({ length: GRID_CELLS }, (_, index) => /* @__PURE__ */ jsx(
  motion.span,
  {
    animate: reduced ? { opacity: 0.45 } : { opacity: [0.2, 1, 0.2] },
    className: "size-1.5 rounded-[2px] bg-current",
    transition: reduced ? { duration: 0 } : {
      delay: (GRID_DELAYS[index] ?? 0) * AI_LOADER_CYCLE_SECONDS / 8,
      duration: AI_LOADER_CYCLE_SECONDS,
      ease: EASE_IN_OUT,
      repeat: Number.POSITIVE_INFINITY
    }
  },
  index
)) });
const Elapsed = () => {
  const startRef = useRef(null);
  const [seconds, setSeconds] = useState(0);
  useAnimationFrame((time) => {
    const start = startRef.current ?? time;
    startRef.current = start;
    const next = (time - start) / MS_PER_SECOND;
    setSeconds(
      (current) => next.toFixed(ELAPSED_DECIMALS) === current.toFixed(ELAPSED_DECIMALS) ? current : next
    );
  });
  return /* @__PURE__ */ jsxs("span", { className: "tabular-nums opacity-60", children: [
    seconds.toFixed(ELAPSED_DECIMALS),
    "s"
  ] });
};
const AILoader = ({
  className,
  label,
  showElapsed = false,
  variant = "dots"
}) => {
  const reduced = Boolean(useReducedMotion());
  return /* @__PURE__ */ jsxs(
    "span",
    {
      "aria-live": "polite",
      className: cn(
        "inline-flex items-center gap-2 text-muted-foreground text-sm",
        className
      ),
      role: "status",
      children: [
        label ? /* @__PURE__ */ jsx("span", { children: label }) : null,
        variant === "dots" && /* @__PURE__ */ jsx(Dots, { reduced }),
        variant === "bar" && /* @__PURE__ */ jsx(Bar, { reduced }),
        variant === "grid" && /* @__PURE__ */ jsx(Grid, { reduced }),
        showElapsed ? /* @__PURE__ */ jsx(Elapsed, {}) : null,
        /* @__PURE__ */ jsx("span", { className: "sr-only", children: label ?? "Loading" })
      ]
    }
  );
};
var stdin_default = AILoader;
export {
  AI_LOADER_CYCLE_SECONDS,
  stdin_default as default
};
