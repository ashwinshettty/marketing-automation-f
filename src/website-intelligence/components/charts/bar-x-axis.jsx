"use client";
import { jsx } from "react/jsx-runtime";
import { motion } from "motion/react";
import { memo, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useChart, useChartStable } from "./chart-context";
function BarXAxisLabel({
  label,
  x,
  crosshairX,
  isHovering,
  tickerHalfWidth
}) {
  const fadeBuffer = 20;
  const fadeRadius = tickerHalfWidth + fadeBuffer;
  let opacity = 1;
  if (isHovering && crosshairX !== null) {
    const distance = Math.abs(x - crosshairX);
    if (distance < tickerHalfWidth) {
      opacity = 0;
    } else if (distance < fadeRadius) {
      opacity = (distance - tickerHalfWidth) / fadeBuffer;
    }
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "absolute",
      style: {
        left: x,
        bottom: 12,
        width: 0,
        display: "flex",
        justifyContent: "center"
      },
      children: /* @__PURE__ */ jsx(
        motion.span,
        {
          animate: { opacity },
          className: cn("whitespace-nowrap text-chart-label text-xs"),
          initial: { opacity: 1 },
          transition: { duration: 0.4, ease: "easeInOut" },
          children: label
        }
      )
    }
  );
}
function BarXAxis(props) {
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
  return /* @__PURE__ */ jsx(BarXAxisInner, { ...props, container });
}
const BarXAxisInner = memo(function BarXAxisInner2({
  tickerHalfWidth = 50,
  showAllLabels = false,
  maxLabels = 12,
  container
}) {
  const { margin, tooltipData, barScale, bandWidth, barXAccessor, data } = useChart();
  const labelsToShow = useMemo(() => {
    if (!(barScale && bandWidth && barXAccessor)) {
      return [];
    }
    const allLabels = data.map((d) => {
      const label = barXAccessor(d);
      const bandX = barScale(label) ?? 0;
      const x = bandX + bandWidth / 2 + margin.left;
      return { label, x };
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
    margin.left,
    showAllLabels,
    maxLabels
  ]);
  const isHovering = tooltipData !== null;
  const crosshairX = tooltipData ? tooltipData.x + margin.left : null;
  return createPortal(
    /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-0", children: labelsToShow.map((item) => /* @__PURE__ */ jsx(
      BarXAxisLabel,
      {
        crosshairX,
        isHovering,
        label: item.label,
        tickerHalfWidth,
        x: item.x
      },
      `${item.label}-${item.x}`
    )) }),
    container
  );
});
BarXAxis.displayName = "BarXAxis";
var stdin_default = BarXAxis;
export {
  BarXAxis,
  stdin_default as default
};
