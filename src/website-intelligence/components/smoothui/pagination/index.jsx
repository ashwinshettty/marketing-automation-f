"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useId, useMemo } from "react";
import { SPRING_DEFAULT } from "@/components/smoothui/lib/animation";
import SmoothButton from "../smooth-button";
const ELLIPSIS = "ellipsis";
const SPRING_INDICATOR = {
  bounce: 0.05,
  duration: 0.25,
  type: "spring"
};
const STAGGER_DELAY = 0.03;
const buildPageRange = (page, totalPages, siblings) => {
  const totalSlots = siblings * 2 + 5;
  if (totalPages <= totalSlots) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const leftSibling = Math.max(page - siblings, 2);
  const rightSibling = Math.min(page + siblings, totalPages - 1);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;
  const items = [1];
  if (showLeftEllipsis) {
    items.push(ELLIPSIS);
  } else {
    for (let i = 2; i < leftSibling; i++) {
      items.push(i);
    }
  }
  for (let i = leftSibling; i <= rightSibling; i++) {
    items.push(i);
  }
  if (showRightEllipsis) {
    items.push(ELLIPSIS);
  } else {
    for (let i = rightSibling + 1; i < totalPages; i++) {
      items.push(i);
    }
  }
  items.push(totalPages);
  return items;
};
function Pagination({
  page,
  totalPages,
  onPageChange,
  siblings = 1,
  className
}) {
  const shouldReduceMotion = useReducedMotion();
  const generatedId = useId();
  const layoutId = `pagination-active-${generatedId}`;
  const pageItems = useMemo(
    () => buildPageRange(page, totalPages, siblings),
    [page, totalPages, siblings]
  );
  const handlePrev = useCallback(() => {
    if (page > 1) {
      onPageChange(page - 1);
    }
  }, [page, onPageChange]);
  const handleNext = useCallback(() => {
    if (page < totalPages) {
      onPageChange(page + 1);
    }
  }, [page, totalPages, onPageChange]);
  return /* @__PURE__ */ jsx(
    "nav",
    {
      "aria-label": "Pagination",
      className: cn("mx-auto flex w-full justify-center", className),
      children: /* @__PURE__ */ jsxs("ul", { className: "flex flex-row items-center gap-1", children: [
        /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
          SmoothButton,
          {
            "aria-label": "Go to previous page",
            className: "gap-1 px-2.5",
            disabled: page <= 1,
            onClick: handlePrev,
            size: "sm",
            type: "button",
            variant: "ghost",
            children: [
              /* @__PURE__ */ jsx(ChevronLeft, { className: "size-4" }),
              /* @__PURE__ */ jsx("span", { className: "hidden sm:block", children: "Previous" })
            ]
          }
        ) }),
        pageItems.map((item, index) => {
          if (item === ELLIPSIS) {
            return /* @__PURE__ */ jsx(
              "li",
              {
                "aria-hidden": "true",
                className: "flex size-9 items-center justify-center",
                children: /* @__PURE__ */ jsx(
                  motion.span,
                  {
                    animate: shouldReduceMotion ? { opacity: 1 } : { opacity: 1, transform: "translateY(0px)" },
                    className: "text-muted-foreground text-sm",
                    initial: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, transform: "translateY(4px)" },
                    transition: shouldReduceMotion ? { duration: 0 } : {
                      ...SPRING_DEFAULT,
                      delay: index * STAGGER_DELAY
                    },
                    children: "..."
                  }
                )
              },
              `ellipsis-${String(index)}`
            );
          }
          const isActive = item === page;
          return /* @__PURE__ */ jsx(
            motion.li,
            {
              animate: shouldReduceMotion ? { opacity: 1 } : { opacity: 1, transform: "translateY(0px)" },
              initial: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, transform: "translateY(4px)" },
              transition: shouldReduceMotion ? { duration: 0 } : {
                ...SPRING_DEFAULT,
                delay: index * STAGGER_DELAY
              },
              children: /* @__PURE__ */ jsxs(
                SmoothButton,
                {
                  "aria-current": isActive ? "page" : void 0,
                  "aria-label": `Go to page ${String(item)}`,
                  className: cn(
                    "relative size-9",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  ),
                  onClick: () => onPageChange(item),
                  size: "icon",
                  type: "button",
                  variant: "ghost",
                  children: [
                    isActive && /* @__PURE__ */ jsx(
                      motion.span,
                      {
                        className: "absolute inset-0 rounded-md border bg-background shadow-sm",
                        layout: true,
                        layoutId,
                        style: { originY: "0px" },
                        transition: shouldReduceMotion ? { duration: 0 } : SPRING_INDICATOR
                      }
                    ),
                    /* @__PURE__ */ jsx("span", { className: "relative z-10", children: item })
                  ]
                }
              )
            },
            item
          );
        }),
        /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
          SmoothButton,
          {
            "aria-label": "Go to next page",
            className: "gap-1 px-2.5",
            disabled: page >= totalPages,
            onClick: handleNext,
            size: "sm",
            type: "button",
            variant: "ghost",
            children: [
              /* @__PURE__ */ jsx("span", { className: "hidden sm:block", children: "Next" }),
              /* @__PURE__ */ jsx(ChevronRight, { className: "size-4" })
            ]
          }
        ) })
      ] })
    }
  );
}
export {
  Pagination as default
};
