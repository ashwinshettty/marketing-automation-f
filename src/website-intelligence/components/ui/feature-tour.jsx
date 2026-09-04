"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion
} from "motion/react";
import { X } from "lucide-react";
const EASE_OUT = [0.16, 1, 0.3, 1];
const FAST_OUT = [0.22, 1, 0.36, 1];
const SPRING_ICON = {
  type: "spring",
  stiffness: 420,
  damping: 34,
  mass: 0.7
};
const SPRING_BG = {
  type: "spring",
  stiffness: 340,
  damping: 30,
  mass: 0.8
};
const FeatureTour = ({
  steps,
  onClose,
  onLearnMore,
  className = "",
  loop = false,
  closeOnBackdrop = true
}) => {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const goToStep = (index) => {
    if (index === currentIndex) return;
    setCurrentIndex(index);
  };
  const goNext = useCallback(() => {
    setCurrentIndex(
      (prev) => prev === steps.length - 1 ? loop ? 0 : prev : prev + 1
    );
  }, [steps.length, loop]);
  const goPrev = useCallback(() => {
    setCurrentIndex(
      (prev) => prev === 0 ? loop ? steps.length - 1 : prev : prev - 1
    );
  }, [steps.length, loop]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [steps?.length, loop, onClose, goNext, goPrev]);
  useEffect(() => {
    const btn = containerRef.current?.querySelector("button");
    btn?.focus();
  }, []);
  if (!steps || steps.length === 0) return null;
  const currentStep = steps[currentIndex];
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "flex items-center justify-center",
      onClick: closeOnBackdrop ? onClose : void 0,
      role: "dialog",
      "aria-modal": "true",
      children: /* @__PURE__ */ jsxs(
        motion.div,
        {
          ref: containerRef,
          onClick: (e) => e.stopPropagation(),
          initial: {
            opacity: 0,
            scale: 0.96,
            y: 16,
            filter: "blur(4px)"
          },
          animate: {
            opacity: 1,
            scale: 1,
            y: 0,
            filter: "blur(0px)"
          },
          exit: {
            opacity: 0,
            scale: 0.98,
            y: 12
          },
          transition: {
            duration: 0.18,
            ease: EASE_OUT
          },
          className: `relative w-full max-w-[400px] sm:aspect-[1/1.3] min-h-[520px] sm:min-h-0 rounded-[34px] border shadow-sm p-6 sm:p-8 flex flex-col items-center overflow-hidden transition-colors duration-300 bg-white border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 ${className}`,
          children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: onClose,
                "aria-label": "Close tour",
                className: "absolute top-6 right-6 p-2 rounded-full transition-colors z-50 bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-800 dark:hover:bg-neutral-700",
                children: /* @__PURE__ */ jsx(
                  X,
                  {
                    size: 20,
                    strokeWidth: 3,
                    className: "text-white dark:text-neutral-200"
                  }
                )
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 w-full flex flex-col items-center justify-center relative", children: [
              /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxs(
                motion.div,
                {
                  initial: {
                    opacity: 0,
                    scale: 0.92,
                    y: 8,
                    filter: "blur(3px)"
                  },
                  animate: {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    filter: "blur(0px)"
                  },
                  exit: {
                    opacity: 0,
                    scale: 0.92,
                    y: -6,
                    filter: "blur(3px)"
                  },
                  transition: {
                    duration: 0.16,
                    ease: FAST_OUT
                  },
                  className: "relative flex items-center justify-center min-h-[120px]",
                  children: [
                    /* @__PURE__ */ jsx(
                      motion.div,
                      {
                        layoutId: "tour-icon-bg",
                        transition: SPRING_BG,
                        className: "absolute w-24 h-24 rounded-3xl\n                           bg-neutral-100 dark:bg-neutral-800\n                           shadow-inner dark:shadow-black/40"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      motion.div,
                      {
                        layoutId: "tour-icon",
                        transition: SPRING_ICON,
                        className: "relative text-neutral-700 dark:text-neutral-200\n                           drop-shadow-[0_4px_12px_rgba(0,0,0,0.12)]\n                           dark:drop-shadow-[0_4px_16px_rgba(255,255,255,0.12)]",
                        children: currentStep.icon
                      }
                    )
                  ]
                },
                currentStep.id
              ) }),
              /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxs(
                motion.div,
                {
                  initial: {
                    opacity: 0,
                    y: shouldReduceMotion ? 0 : 20
                  },
                  animate: {
                    opacity: 1,
                    y: 0
                  },
                  exit: {
                    opacity: 0,
                    y: shouldReduceMotion ? 0 : -14
                  },
                  transition: {
                    duration: 0.16,
                    ease: EASE_OUT
                  },
                  className: "space-y-2 px-4 mt-8 sm:mt-12 text-center",
                  children: [
                    /* @__PURE__ */ jsx("h2", { className: "text-[26px] font-bold text-neutral-900 dark:text-white", children: currentStep.title }),
                    /* @__PURE__ */ jsx("p", { className: "text-[20px] font-medium leading-tight text-neutral-500 dark:text-neutral-400", children: currentStep.description }),
                    onLearnMore && /* @__PURE__ */ jsx(
                      motion.button,
                      {
                        whileHover: { scale: 1.03 },
                        whileTap: { scale: 0.97 },
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 30
                        },
                        onClick: () => onLearnMore(currentStep),
                        className: "mt-6 sm:mt-10 px-10 py-3 rounded-full font-semibold text-lg transition-colors bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700",
                        children: "Learn More"
                      }
                    )
                  ]
                },
                `content-${currentStep.id}`
              ) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-6 sm:mt-8 flex items-center gap-3", role: "tablist", children: steps.map((step, index) => /* @__PURE__ */ jsx(
              "button",
              {
                role: "tab",
                "aria-selected": index === currentIndex,
                "aria-label": `Go to ${step.title}`,
                onClick: () => goToStep(index),
                className: "relative h-2 focus:outline-none",
                children: /* @__PURE__ */ jsx(
                  motion.div,
                  {
                    animate: {
                      scale: index === currentIndex ? 1.2 : 1
                    },
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 20
                    },
                    className: `h-[12px] w-[12px] rounded-full ${index === currentIndex ? "bg-neutral-500 dark:bg-neutral-200" : "bg-neutral-200 dark:bg-neutral-700"}`
                  }
                )
              },
              step.id
            )) }),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 pointer-events-none rounded-[40px] bg-linear-to-br from-white/20 via-transparent to-black/5 dark:from-white/5 dark:via-transparent dark:to-black/40" })
          ]
        }
      )
    }
  );
};
export {
  FeatureTour
};
