"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronUp, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
function OnboardingChecklist({
  steps,
  title = "Getting started",
  defaultExpanded = true,
  onStepClick,
  className
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const completedCount = steps.filter((s) => s.isCompleted).length;
  const totalSteps = steps.length || 1;
  const springConfig = { type: "spring", stiffness: 300, damping: 30 };
  const nextStepId = steps.find((s) => !s.isCompleted)?.id;
  return /* @__PURE__ */ jsx("div", { className: cn("w-full", className), children: /* @__PURE__ */ jsxs(
    motion.div,
    {
      layout: true,
      transition: springConfig,
      className: "w-full max-w-md overflow-hidden rounded-xl border border-border bg-muted/60 shadow-sm",
      children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => setIsExpanded((value) => !value),
            className: "flex w-full cursor-pointer items-center justify-between p-3.5 text-left select-none outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
            "aria-expanded": isExpanded,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-center gap-3", children: [
                /* @__PURE__ */ jsx(
                  motion.span,
                  {
                    animate: { rotate: isExpanded ? 0 : 180 },
                    className: "inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground",
                    children: /* @__PURE__ */ jsx(ChevronUp, { size: 20, "aria-hidden": "true" })
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "truncate text-sm font-semibold text-foreground", children: title })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "ml-2 flex shrink-0 items-center gap-3", children: [
                /* @__PURE__ */ jsx("div", { className: "flex gap-0.5", "aria-hidden": "true", children: Array.from({ length: 14 }).map((_, i) => /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: cn(
                      "h-3.5 w-[3px] rounded-full transition-colors duration-500",
                      i < completedCount / totalSteps * 14 ? "bg-success" : "bg-border"
                    )
                  },
                  i
                )) }),
                /* @__PURE__ */ jsxs("span", { className: "min-w-7 text-right text-xs font-semibold tabular-nums text-muted-foreground", children: [
                  completedCount,
                  "/",
                  steps.length
                ] })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsx(AnimatePresence, { initial: false, children: isExpanded && /* @__PURE__ */ jsx(
          motion.div,
          {
            initial: { height: 0, opacity: 0 },
            animate: { height: "auto", opacity: 1 },
            exit: { height: 0, opacity: 0 },
            transition: springConfig,
            className: "overflow-hidden border-t border-border bg-card",
            children: /* @__PURE__ */ jsx("ul", { className: "space-y-0.5 p-2", children: steps.map((step) => {
              const isNext = step.id === nextStepId;
              const interactive = typeof onStepClick === "function" && !step.isCompleted;
              return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  disabled: !interactive,
                  onClick: () => interactive && onStepClick?.(step),
                  className: cn(
                    "group flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left transition-colors",
                    interactive && "cursor-pointer outline-none hover:bg-muted/70 focus-visible:ring-3 focus-visible:ring-ring/40 active:scale-[0.99]",
                    !interactive && "cursor-default"
                  ),
                  children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-center gap-3", children: [
                      step.isCompleted ? /* @__PURE__ */ jsx("span", { className: "flex size-5 shrink-0 items-center justify-center rounded-full bg-success text-white shadow-sm", children: /* @__PURE__ */ jsx(Check, { size: 11, strokeWidth: 3.5, "aria-hidden": "true" }) }) : /* @__PURE__ */ jsx(
                        "span",
                        {
                          className: cn(
                            "flex size-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold",
                            isNext ? "border-brand-dark bg-brand-dark text-brand-foreground" : "border-border text-muted-foreground"
                          ),
                          children: step.id
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "span",
                        {
                          className: cn(
                            "truncate text-sm font-medium",
                            step.isCompleted ? "text-muted-foreground" : "text-foreground"
                          ),
                          children: step.title
                        }
                      )
                    ] }),
                    !step.isCompleted && /* @__PURE__ */ jsx(
                      ChevronRight,
                      {
                        size: 16,
                        className: "shrink-0 text-muted-foreground/60",
                        "aria-hidden": "true"
                      }
                    )
                  ]
                }
              ) }, step.id);
            }) })
          }
        ) })
      ]
    }
  ) });
}
export {
  OnboardingChecklist
};
