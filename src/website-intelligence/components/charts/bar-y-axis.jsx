"use client";
import { jsx } from "react/jsx-runtime";
import { motion } from "motion/react";
import { memo, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useChart, useChartStable } from "./chart-context";
function BarYAxisLabel({
  label,
  y,
  bandHeight,
  isHovered
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "absolute right-0 flex items-center justify-end pr-2",
      style: {
        top: y,
        height: bandHeight
      },
      children: /* @__PURE__ */ jsx(
        motion.span,
        {
          animate: {
            opacity: isHovered ? 1 : 0.7,
            color: isHovered ? "var(--foreground)" : "var(--chart-label, var(--color-zinc-500))"
          },
          className: cn("truncate whitespace-nowrap text-right text-xs"),
          initial: {
            opacity: 0.7,
            color: "var(--chart-label, var(--color-zinc-500))"
          },
          style: { maxWidth: 70 },
          transition: { duration: 0.15 },
          children: label
        }
      )
    }
  );
}
function BarYAxis(props) {
  const { containerRef, barScale } = useChartStable();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const container = containerRef.current;
  if (!(mounted && container)) {
    return null;
  }
  if (!barScale) {
    return null;
  }
  return /* @__PURE__ */ jsx(BarYAxisInner, { ...props, container });
}
const BarYAxisInner = memo(function BarYAxisInner2({
  showAllLabels = true,
  maxLabels = 20,
  container
}) {
  const { margin, barScale, bandWidth, barXAccessor, data, hoveredBarIndex } = useChart();
  const labelsToShow = useMemo(() => {
    if (!(barScale && bandWidth && barXAccessor)) {
      return [];
    }
    const allLabels = data.map((d, i) => {
      const label = barXAccessor(d);
      const bandY = barScale(label) ?? 0;
      const y = bandY + margin.top;
      return { label, y, bandHeight: bandWidth, index: i };
    });
    if (showAllLabels || allLabels.length <= maxLabels) {
      return allLabels;
    }
    const step = Math.ceil(allLabels.length / maxLabels);
    return allLabels.filter((_, i) => i % step === 0);
  }, [
    barScale,
    bandWidth,
    barXAccessor,
    data,
    margin.top,
    showAllLabels,
    maxLabels
  ]);
  return createPortal(
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "pointer-events-none absolute top-0 bottom-0",
        style: {
          left: 0,
          width: margin.left
        },
        children: labelsToShow.map((item) => /* @__PURE__ */ jsx(
          BarYAxisLabel,
          {
            bandHeight: item.bandHeight,
            isHovered: hoveredBarIndex === item.index,
            label: item.label,
            y: item.y
          },
          `${item.label}-${item.y}`
        ))
      }
    ),
    container
  );
});
BarYAxis.displayName = "BarYAxis";
var stdin_default = BarYAxis;
export {
  BarYAxis,
  stdin_default as default
};
