"use client";
import { jsx } from "react/jsx-runtime";
import { Check, Copy, LoaderCircle } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useState } from "react";
const defaultIcons = {
  idle: /* @__PURE__ */ jsx(Copy, { size: 16 }),
  loading: /* @__PURE__ */ jsx(LoaderCircle, { className: "animate-spin", size: 16 }),
  success: /* @__PURE__ */ jsx(Check, { size: 16 })
};
function ButtonCopy({
  onCopy,
  idleIcon = defaultIcons.idle,
  loadingIcon = defaultIcons.loading,
  successIcon = defaultIcons.success,
  className = "",
  duration = 2e3,
  loadingDuration = 1e3,
  disabled = false
}) {
  const [buttonState, setButtonState] = useState("idle");
  const shouldReduceMotion = useReducedMotion();
  const handleClick = useCallback(async () => {
    setButtonState("loading");
    if (onCopy) {
      await onCopy();
    }
    setTimeout(() => {
      setButtonState("success");
    }, loadingDuration);
    setTimeout(() => {
      setButtonState("idle");
    }, loadingDuration + duration);
  }, [onCopy, loadingDuration, duration]);
  const icons = {
    idle: idleIcon,
    loading: loadingIcon,
    success: successIcon
  };
  const ariaLabels = {
    idle: "Copy",
    loading: "Copying...",
    success: "Copied"
  };
  return /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsx(
    "button",
    {
      "aria-label": ariaLabels[buttonState],
      "aria-live": "polite",
      className: `relative min-h-[44px] w-auto min-w-[44px] cursor-pointer overflow-hidden rounded-full border bg-background p-3 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 ${className}`,
      disabled: buttonState !== "idle" || disabled,
      onClick: handleClick,
      type: "button",
      children: /* @__PURE__ */ jsx(AnimatePresence, { initial: false, mode: "popLayout", children: /* @__PURE__ */ jsx(
        motion.span,
        {
          animate: shouldReduceMotion ? { opacity: 1 } : { filter: "blur(0px)", opacity: 1, y: 0 },
          className: "flex w-full items-center justify-center",
          exit: shouldReduceMotion ? { opacity: 0, transition: { duration: 0 } } : { filter: "blur(10px)", opacity: 0, y: 25 },
          initial: shouldReduceMotion ? { opacity: 1 } : { filter: "blur(10px)", opacity: 0, y: -25 },
          transition: shouldReduceMotion ? { duration: 0 } : { bounce: 0, duration: 0.25, type: "spring" },
          children: icons[buttonState]
        },
        buttonState
      ) })
    }
  ) });
}
export {
  ButtonCopy as default
};
