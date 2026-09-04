"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { motion, useTransform } from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import { cn } from "@/lib/utils";
import { useEnterComplete } from "./use-enter-complete";
import { useMountProgress } from "./use-mount-progress";
import { intFmt } from "./chart-formatters";
const fmtPct = (p) => `${Math.round(p)}%`;
const fmtVal = intFmt;
function hSegmentPath(normStart, normEnd, segW, H, layerScale, straight = false) {
  const my = H / 2;
  const h0 = normStart * H * 0.44 * layerScale;
  const h1 = normEnd * H * 0.44 * layerScale;
  if (straight) {
    return `M 0 ${my - h0} L ${segW} ${my - h1} L ${segW} ${my + h1} L 0 ${my + h0} Z`;
  }
  const cx = segW * 0.55;
  const top = `M 0 ${my - h0} C ${cx} ${my - h0}, ${segW - cx} ${my - h1}, ${segW} ${my - h1}`;
  const bot = `L ${segW} ${my + h1} C ${segW - cx} ${my + h1}, ${cx} ${my + h0}, 0 ${my + h0}`;
  return `${top} ${bot} Z`;
}
function vSegmentPath(normStart, normEnd, segH, W, layerScale, straight = false) {
  const mx = W / 2;
  const w0 = normStart * W * 0.44 * layerScale;
  const w1 = normEnd * W * 0.44 * layerScale;
  if (straight) {
    return `M ${mx - w0} 0 L ${mx - w1} ${segH} L ${mx + w1} ${segH} L ${mx + w0} 0 Z`;
  }
  const cy = segH * 0.55;
  const left = `M ${mx - w0} 0 C ${mx - w0} ${cy}, ${mx - w1} ${segH - cy}, ${mx - w1} ${segH}`;
  const right = `L ${mx + w1} ${segH} C ${mx + w1} ${segH - cy}, ${mx + w0} ${cy}, ${mx + w0} 0`;
  return `${left} ${right} Z`;
}
function HRing({
  d,
  color,
  fill,
  opacity,
  hovered,
  ringIndex,
  totalRings
}) {
  const extraScale = 1 + ringIndex / Math.max(totalRings - 1, 1) * 0.12;
  return /* @__PURE__ */ jsx(
    motion.path,
    {
      animate: { scaleY: hovered ? extraScale : 1 },
      d,
      fill: fill ?? color,
      opacity,
      style: { transformOrigin: "center center" },
      transition: {
        type: "spring",
        stiffness: 300 - ringIndex * 60,
        damping: 24 - ringIndex * 3
      }
    }
  );
}
function HSegment({
  index,
  normStart,
  normEnd,
  segW,
  fullH,
  color,
  layers,
  staggerDelay,
  enterTransition,
  hovered,
  dimmed,
  renderPattern,
  straight,
  gradientStops
}) {
  const patternId = `funnel-h-pattern-${index}`;
  const gradientId = `funnel-h-grad-${index}`;
  const mountProgress = useMountProgress(
    enterTransition,
    index * staggerDelay,
    index
  );
  const enterComplete = useEnterComplete(mountProgress);
  const entranceScaleX = useTransform(mountProgress, [0, 1], [0, 1]);
  const entranceScaleY = useTransform(mountProgress, [0, 1], [0, 1]);
  const rings = Array.from({ length: layers }, (_, l) => {
    const scale = 1 - l / layers * 0.35;
    const opacity = 0.18 + l / (layers - 1 || 1) * 0.65;
    return {
      d: hSegmentPath(normStart, normEnd, segW, fullH, scale, straight),
      opacity
    };
  });
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      animate: { opacity: dimmed ? 0.4 : 1 },
      className: "pointer-events-none relative shrink-0 overflow-visible",
      style: {
        width: segW,
        height: fullH,
        zIndex: hovered ? 10 : 1
      },
      transition: { opacity: { duration: 0.15 } },
      children: enterComplete ? /* @__PURE__ */ jsx("div", { className: "absolute inset-0 overflow-visible", children: /* @__PURE__ */ jsxs(
        "svg",
        {
          "aria-hidden": "true",
          className: "absolute inset-0 h-full w-full overflow-visible",
          preserveAspectRatio: "none",
          role: "presentation",
          viewBox: `0 0 ${segW} ${fullH}`,
          children: [
            /* @__PURE__ */ jsxs("defs", { children: [
              gradientStops && /* @__PURE__ */ jsx("linearGradient", { id: gradientId, x1: "0", x2: "1", y1: "0", y2: "0", children: gradientStops.map((stop) => /* @__PURE__ */ jsx(
                "stop",
                {
                  offset: typeof stop.offset === "number" ? `${stop.offset * 100}%` : stop.offset,
                  stopColor: stop.color
                },
                `${stop.offset}-${stop.color}`
              )) }),
              renderPattern?.(patternId, color)
            ] }),
            rings.map((r, i) => {
              const isInnermost = i === rings.length - 1;
              let ringFill;
              if (isInnermost && renderPattern) {
                ringFill = `url(#${patternId})`;
              } else if (isInnermost && gradientStops) {
                ringFill = `url(#${gradientId})`;
              }
              const ringKey = `h-ring-${r.opacity.toFixed(2)}`;
              return /* @__PURE__ */ jsx(
                HRing,
                {
                  color,
                  d: r.d,
                  fill: ringFill,
                  hovered,
                  opacity: r.opacity,
                  ringIndex: i,
                  totalRings: layers
                },
                ringKey
              );
            })
          ]
        }
      ) }) : /* @__PURE__ */ jsx(
        motion.div,
        {
          className: "absolute inset-0 overflow-visible",
          style: {
            scaleX: entranceScaleX,
            scaleY: entranceScaleY,
            transformOrigin: "left center"
          },
          children: /* @__PURE__ */ jsxs(
            "svg",
            {
              "aria-hidden": "true",
              className: "absolute inset-0 h-full w-full overflow-visible",
              preserveAspectRatio: "none",
              role: "presentation",
              viewBox: `0 0 ${segW} ${fullH}`,
              children: [
                /* @__PURE__ */ jsxs("defs", { children: [
                  gradientStops && /* @__PURE__ */ jsx("linearGradient", { id: gradientId, x1: "0", x2: "1", y1: "0", y2: "0", children: gradientStops.map((stop) => /* @__PURE__ */ jsx(
                    "stop",
                    {
                      offset: typeof stop.offset === "number" ? `${stop.offset * 100}%` : stop.offset,
                      stopColor: stop.color
                    },
                    `${stop.offset}-${stop.color}`
                  )) }),
                  renderPattern?.(patternId, color)
                ] }),
                rings.map((r, i) => {
                  const isInnermost = i === rings.length - 1;
                  let ringFill;
                  if (isInnermost && renderPattern) {
                    ringFill = `url(#${patternId})`;
                  } else if (isInnermost && gradientStops) {
                    ringFill = `url(#${gradientId})`;
                  }
                  const ringKey = `h-ring-${r.opacity.toFixed(2)}`;
                  return /* @__PURE__ */ jsx(
                    HRing,
                    {
                      color,
                      d: r.d,
                      fill: ringFill,
                      hovered,
                      opacity: r.opacity,
                      ringIndex: i,
                      totalRings: layers
                    },
                    ringKey
                  );
                })
              ]
            }
          )
        }
      )
    }
  );
}
function VRing({
  d,
  color,
  fill,
  opacity,
  hovered,
  ringIndex,
  totalRings
}) {
  const extraScale = 1 + ringIndex / Math.max(totalRings - 1, 1) * 0.12;
  return /* @__PURE__ */ jsx(
    motion.path,
    {
      animate: { scaleX: hovered ? extraScale : 1 },
      d,
      fill: fill ?? color,
      opacity,
      style: { transformOrigin: "center center" },
      transition: {
        type: "spring",
        stiffness: 300 - ringIndex * 60,
        damping: 24 - ringIndex * 3
      }
    }
  );
}
function VSegment({
  index,
  normStart,
  normEnd,
  segH,
  fullW,
  color,
  layers,
  staggerDelay,
  enterTransition,
  hovered,
  dimmed,
  renderPattern,
  straight,
  gradientStops
}) {
  const patternId = `funnel-v-pattern-${index}`;
  const gradientId = `funnel-v-grad-${index}`;
  const mountProgress = useMountProgress(
    enterTransition,
    index * staggerDelay,
    index
  );
  const enterComplete = useEnterComplete(mountProgress);
  const entranceScaleY = useTransform(mountProgress, [0, 1], [0, 1]);
  const entranceScaleX = useTransform(mountProgress, [0, 1], [0, 1]);
  const rings = Array.from({ length: layers }, (_, l) => {
    const scale = 1 - l / layers * 0.35;
    const opacity = 0.18 + l / (layers - 1 || 1) * 0.65;
    return {
      d: vSegmentPath(normStart, normEnd, segH, fullW, scale, straight),
      opacity
    };
  });
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      animate: { opacity: dimmed ? 0.4 : 1 },
      className: "pointer-events-none relative shrink-0 overflow-visible",
      style: {
        width: fullW,
        height: segH,
        zIndex: hovered ? 10 : 1
      },
      transition: { opacity: { duration: 0.15 } },
      children: enterComplete ? /* @__PURE__ */ jsx("div", { className: "absolute inset-0 overflow-visible", children: /* @__PURE__ */ jsxs(
        "svg",
        {
          "aria-hidden": "true",
          className: "absolute inset-0 h-full w-full overflow-visible",
          preserveAspectRatio: "none",
          role: "presentation",
          viewBox: `0 0 ${fullW} ${segH}`,
          children: [
            /* @__PURE__ */ jsxs("defs", { children: [
              gradientStops && /* @__PURE__ */ jsx("linearGradient", { id: gradientId, x1: "0", x2: "0", y1: "0", y2: "1", children: gradientStops.map((stop) => /* @__PURE__ */ jsx(
                "stop",
                {
                  offset: typeof stop.offset === "number" ? `${stop.offset * 100}%` : stop.offset,
                  stopColor: stop.color
                },
                `${stop.offset}-${stop.color}`
              )) }),
              renderPattern?.(patternId, color)
            ] }),
            rings.map((r, i) => {
              const isInnermost = i === rings.length - 1;
              let ringFill;
              if (isInnermost && renderPattern) {
                ringFill = `url(#${patternId})`;
              } else if (isInnermost && gradientStops) {
                ringFill = `url(#${gradientId})`;
              }
              const ringKey = `v-ring-${r.opacity.toFixed(2)}`;
              return /* @__PURE__ */ jsx(
                VRing,
                {
                  color,
                  d: r.d,
                  fill: ringFill,
                  hovered,
                  opacity: r.opacity,
                  ringIndex: i,
                  totalRings: layers
                },
                ringKey
              );
            })
          ]
        }
      ) }) : /* @__PURE__ */ jsx(
        motion.div,
        {
          className: "absolute inset-0 overflow-visible",
          style: {
            scaleY: entranceScaleY,
            scaleX: entranceScaleX,
            transformOrigin: "center top"
          },
          children: /* @__PURE__ */ jsxs(
            "svg",
            {
              "aria-hidden": "true",
              className: "absolute inset-0 h-full w-full overflow-visible",
              preserveAspectRatio: "none",
              role: "presentation",
              viewBox: `0 0 ${fullW} ${segH}`,
              children: [
                /* @__PURE__ */ jsxs("defs", { children: [
                  gradientStops && /* @__PURE__ */ jsx("linearGradient", { id: gradientId, x1: "0", x2: "0", y1: "0", y2: "1", children: gradientStops.map((stop) => /* @__PURE__ */ jsx(
                    "stop",
                    {
                      offset: typeof stop.offset === "number" ? `${stop.offset * 100}%` : stop.offset,
                      stopColor: stop.color
                    },
                    `${stop.offset}-${stop.color}`
                  )) }),
                  renderPattern?.(patternId, color)
                ] }),
                rings.map((r, i) => {
                  const isInnermost = i === rings.length - 1;
                  let ringFill;
                  if (isInnermost && renderPattern) {
                    ringFill = `url(#${patternId})`;
                  } else if (isInnermost && gradientStops) {
                    ringFill = `url(#${gradientId})`;
                  }
                  const ringKey = `v-ring-${r.opacity.toFixed(2)}`;
                  return /* @__PURE__ */ jsx(
                    VRing,
                    {
                      color,
                      d: r.d,
                      fill: ringFill,
                      hovered,
                      opacity: r.opacity,
                      ringIndex: i,
                      totalRings: layers
                    },
                    ringKey
                  );
                })
              ]
            }
          )
        }
      )
    }
  );
}
function SegmentLabel({
  stage,
  pct,
  isHorizontal,
  showValues,
  showPercentage,
  showLabels,
  formatPercentage,
  formatValue,
  index,
  staggerDelay,
  layout = "spread",
  orientation,
  align = "center"
}) {
  const display = stage.displayValue ?? formatValue(stage.value);
  const valueEl = showValues && /* @__PURE__ */ jsx("span", { className: "whitespace-nowrap font-semibold text-foreground text-sm", children: display });
  const pctEl = showPercentage && /* @__PURE__ */ jsx("span", { className: "rounded-full bg-foreground px-3 py-1 font-bold text-background text-xs shadow-sm", children: formatPercentage(pct) });
  const labelEl = showLabels && /* @__PURE__ */ jsx("span", { className: "whitespace-nowrap font-medium text-muted-foreground text-xs", children: stage.label });
  if (layout === "spread") {
    return /* @__PURE__ */ jsx(
      motion.div,
      {
        animate: { opacity: 1 },
        className: cn(
          "absolute inset-0 flex",
          isHorizontal ? "flex-col items-center" : "flex-row items-center"
        ),
        initial: { opacity: 0 },
        transition: {
          delay: index * staggerDelay + 0.25,
          duration: 0.35,
          ease: "easeOut"
        },
        children: isHorizontal ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "flex h-[16%] items-end justify-center pb-1", children: valueEl }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-1 items-center justify-center", children: pctEl }),
          /* @__PURE__ */ jsx("div", { className: "flex h-[16%] items-start justify-center pt-1", children: labelEl })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "flex w-[16%] items-center justify-end pr-2", children: valueEl }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-1 items-center justify-center", children: pctEl }),
          /* @__PURE__ */ jsx("div", { className: "flex w-[16%] items-center justify-start pl-2", children: labelEl })
        ] })
      }
    );
  }
  const resolvedOrientation = orientation ?? (isHorizontal ? "vertical" : "horizontal");
  const isVerticalStack = resolvedOrientation === "vertical";
  const justifyMap = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end"
  };
  const itemsMap = {
    start: "items-start",
    center: "items-center",
    end: "items-end"
  };
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      animate: { opacity: 1 },
      className: cn(
        "absolute inset-0 flex",
        // For horizontal funnel, align controls vertical placement
        // For vertical funnel, align controls horizontal placement
        isHorizontal ? cn("flex-col items-center", justifyMap[align]) : cn("flex-row items-center", justifyMap[align])
      ),
      initial: { opacity: 0 },
      style: {
        padding: isHorizontal ? "8% 0" : "0 8%"
      },
      transition: {
        delay: index * staggerDelay + 0.25,
        duration: 0.35,
        ease: "easeOut"
      },
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: cn(
            "flex gap-1.5",
            isVerticalStack ? cn("flex-col", itemsMap[isHorizontal ? "center" : align]) : cn("flex-row", itemsMap.center)
          ),
          children: [
            valueEl,
            pctEl,
            labelEl
          ]
        }
      )
    }
  );
}
function FunnelChart({
  data,
  orientation = "horizontal",
  color = "var(--chart-1)",
  layers = 3,
  className,
  style,
  showPercentage = true,
  showValues = true,
  showLabels = true,
  hoveredIndex: hoveredIndexProp,
  onHoverChange,
  formatPercentage = fmtPct,
  formatValue = fmtVal,
  staggerDelay = 0.12,
  enterTransition,
  gap = 4,
  renderPattern,
  edges = "curved",
  labelLayout = "spread",
  labelOrientation,
  labelAlign = "center",
  grid: gridProp = false
}) {
  const ref = useRef(null);
  const [sz, setSz] = useState({ w: 0, h: 0 });
  const [internalHoveredIndex, setInternalHoveredIndex] = useState(null);
  const isControlled = hoveredIndexProp !== void 0;
  const hoveredIndex = isControlled ? hoveredIndexProp : internalHoveredIndex;
  const setHoveredIndex = useCallback(
    (index) => {
      if (isControlled) {
        onHoverChange?.(index);
      } else {
        setInternalHoveredIndex(index);
      }
    },
    [isControlled, onHoverChange]
  );
  const measure = useCallback(() => {
    if (!ref.current) {
      return;
    }
    const { width: w, height: h } = ref.current.getBoundingClientRect();
    if (w > 0 && h > 0) {
      setSz({ w, h });
    }
  }, []);
  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (ref.current) {
      ro.observe(ref.current);
    }
    return () => ro.disconnect();
  }, [measure]);
  if (!data.length) {
    return null;
  }
  const first = data[0];
  if (!first) {
    return null;
  }
  const max = first.value;
  const n = data.length;
  const norms = data.map((d) => d.value / max);
  const horiz = orientation === "horizontal";
  const { w: W, h: H } = sz;
  const totalGap = gap * (n - 1);
  const segW = (W - (horiz ? totalGap : 0)) / n;
  const segH = (H - (horiz ? 0 : totalGap)) / n;
  const gridEnabled = gridProp !== false;
  const gridCfg = typeof gridProp === "object" ? gridProp : {};
  const showBands = gridEnabled && (gridCfg.bands ?? true);
  const bandColor = gridCfg.bandColor ?? "var(--color-muted)";
  const showGridLines = gridEnabled && (gridCfg.lines ?? true);
  const gridLineColor = gridCfg.lineColor ?? "var(--chart-grid)";
  const gridLineOpacity = gridCfg.lineOpacity ?? 1;
  const gridLineWidth = gridCfg.lineWidth ?? 1;
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn("relative w-full select-none overflow-visible", className),
      ref,
      style: {
        aspectRatio: horiz ? "2.2 / 1" : "1 / 1.8",
        ...style
      },
      children: W > 0 && H > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
        gridEnabled && /* @__PURE__ */ jsx(
          "svg",
          {
            "aria-hidden": "true",
            className: "pointer-events-none absolute inset-0 h-full w-full",
            preserveAspectRatio: "none",
            role: "presentation",
            viewBox: `0 0 ${W} ${H}`,
            children: showBands && data.map((stage, i) => {
              if (i % 2 !== 0) {
                return null;
              }
              if (horiz) {
                const x = (segW + gap) * i;
                return /* @__PURE__ */ jsx(
                  "rect",
                  {
                    fill: bandColor,
                    height: H,
                    width: segW,
                    x,
                    y: 0
                  },
                  `band-${stage.label}`
                );
              }
              const y = (segH + gap) * i;
              return /* @__PURE__ */ jsx(
                "rect",
                {
                  fill: bandColor,
                  height: segH,
                  width: W,
                  x: 0,
                  y
                },
                `band-${stage.label}`
              );
            })
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: cn(
              "absolute inset-0 flex overflow-visible",
              horiz ? "flex-row" : "flex-col"
            ),
            style: { gap },
            children: data.map((stage, i) => {
              const normStart = norms[i] ?? 0;
              const normEnd = norms[Math.min(i + 1, n - 1)] ?? 0;
              const firstStop = stage.gradient?.[0];
              const segColor = firstStop ? firstStop.color : stage.color ?? color;
              return horiz ? /* @__PURE__ */ jsx(
                HSegment,
                {
                  color: segColor,
                  dimmed: hoveredIndex !== null && hoveredIndex !== i,
                  enterTransition,
                  fullH: H,
                  gradientStops: stage.gradient,
                  hovered: hoveredIndex === i,
                  index: i,
                  layers,
                  normEnd,
                  normStart,
                  renderPattern,
                  segW,
                  staggerDelay,
                  straight: edges === "straight"
                },
                stage.label
              ) : /* @__PURE__ */ jsx(
                VSegment,
                {
                  color: segColor,
                  dimmed: hoveredIndex !== null && hoveredIndex !== i,
                  enterTransition,
                  fullW: W,
                  gradientStops: stage.gradient,
                  hovered: hoveredIndex === i,
                  index: i,
                  layers,
                  normEnd,
                  normStart,
                  renderPattern,
                  segH,
                  staggerDelay,
                  straight: edges === "straight"
                },
                stage.label
              );
            })
          }
        ),
        gridEnabled && showGridLines && /* @__PURE__ */ jsx(
          "svg",
          {
            "aria-hidden": "true",
            className: "pointer-events-none absolute inset-0 h-full w-full",
            preserveAspectRatio: "none",
            role: "presentation",
            viewBox: `0 0 ${W} ${H}`,
            children: Array.from({ length: n - 1 }, (_, i) => {
              const idx = i + 1;
              const gridKey = `grid-${idx}`;
              if (horiz) {
                const x = segW * idx + gap * i + gap / 2;
                return /* @__PURE__ */ jsx(
                  "line",
                  {
                    stroke: gridLineColor,
                    strokeOpacity: gridLineOpacity,
                    strokeWidth: gridLineWidth,
                    x1: x,
                    x2: x,
                    y1: 0,
                    y2: H
                  },
                  gridKey
                );
              }
              const y = segH * idx + gap * i + gap / 2;
              return /* @__PURE__ */ jsx(
                "line",
                {
                  stroke: gridLineColor,
                  strokeOpacity: gridLineOpacity,
                  strokeWidth: gridLineWidth,
                  x1: 0,
                  x2: W,
                  y1: y,
                  y2: y
                },
                gridKey
              );
            })
          }
        ),
        data.map((stage, i) => {
          const pct = stage.value / max * 100;
          const posStyle = horiz ? {
            left: (segW + gap) * i,
            width: segW,
            top: 0,
            height: H
          } : {
            top: (segH + gap) * i,
            height: segH,
            left: 0,
            width: W
          };
          const isDimmed = hoveredIndex !== null && hoveredIndex !== i;
          return /* @__PURE__ */ jsx(
            motion.div,
            {
              animate: { opacity: isDimmed ? 0.4 : 1 },
              className: "absolute cursor-pointer",
              onMouseEnter: () => setHoveredIndex(i),
              onMouseLeave: () => setHoveredIndex(null),
              style: { ...posStyle, zIndex: 20 },
              transition: { type: "spring", stiffness: 300, damping: 24 },
              children: /* @__PURE__ */ jsx(
                SegmentLabel,
                {
                  align: labelAlign,
                  formatPercentage,
                  formatValue,
                  index: i,
                  isHorizontal: horiz,
                  layout: labelLayout,
                  orientation: labelOrientation,
                  pct,
                  showLabels,
                  showPercentage,
                  showValues,
                  stage,
                  staggerDelay
                }
              )
            },
            `lbl-${stage.label}`
          );
        })
      ] })
    }
  );
}
export {
  FunnelChart
};
