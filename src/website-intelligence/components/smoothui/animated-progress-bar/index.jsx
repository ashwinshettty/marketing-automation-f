import { jsx, jsxs } from "react/jsx-runtime";
import { motion, useReducedMotion } from "motion/react";
const MIN_PROGRESS_VALUE = 0;
const MAX_PROGRESS_VALUE = 100;
const SPRING = {
  damping: 10,
  duration: 0.25,
  mass: 0.75,
  stiffness: 100,
  type: "spring"
};
function AnimatedProgressBar({
  value,
  label,
  color = "#6366f1",
  className = "",
  barClassName = "",
  labelClassName = ""
}) {
  const shouldReduceMotion = useReducedMotion();
  return /* @__PURE__ */ jsxs("div", { className: `w-full ${className}`, children: [
    label ? /* @__PURE__ */ jsx("div", { className: `mb-1 font-medium text-sm ${labelClassName}`, children: label }) : null,
    /* @__PURE__ */ jsx("div", { className: "relative h-3 w-full overflow-hidden rounded border bg-background", children: /* @__PURE__ */ jsx(
      motion.div,
      {
        animate: {
          width: `${Math.max(MIN_PROGRESS_VALUE, Math.min(MAX_PROGRESS_VALUE, value))}%`
        },
        className: `h-full rounded bg-background ${barClassName}`,
        initial: { width: MIN_PROGRESS_VALUE },
        style: { backgroundColor: color },
        transition: shouldReduceMotion ? { duration: 0 } : SPRING
      }
    ) })
  ] });
}
export {
  AnimatedProgressBar as default
};
