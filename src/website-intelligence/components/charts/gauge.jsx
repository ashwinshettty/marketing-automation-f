"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { ParentSize } from "@visx/responsive";
import { motion, useReducedMotion } from "motion/react";
import { useId, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  defaultChartStatFlowFormat
} from "./chart-stat-flow";
import {
  GaugeLabelLayout,
  GaugeLabelShell
} from "./gauge-label-layout";
import {
  collectGaugeDefsElements,
  createNotchPath,
  DEFAULT_ACTIVE_FILL_OPACITY,
  DEFAULT_ACTIVE_GRADIENT,
  DEFAULT_INACTIVE_FILL_OPACITY,
  DEFAULT_LINEAR_GAUGE_HEIGHT,
  interpolateGaugeHex,
  resolveGaugeActiveFill,
  resolveGaugeBgFill
} from "./notch-gauge-shared";
import { PieCenterShell } from "./pie-center-shell";
const DEFAULT_NOTCH_ENTER_TRANSITION = {
  type: "spring",
  stiffness: 300,
  damping: 20
};
function GaugeNotchSvg({
  notches,
  width,
  height,
  notchCornerRadius,
  cornerDepth,
  geometryScrubbing,
  notchTransition,
  stagger,
  defsChildren,
  useThemePaletteGradient,
  themeActiveGradientId,
  resolvedInactiveFillOpacity,
  resolvedActiveFillOpacity,
  resolveBgFill,
  resolveActiveFill
}) {
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      "aria-hidden": "true",
      className: "block w-full overflow-visible",
      height,
      viewBox: `0 0 ${width} ${height}`,
      width,
      children: [
        defsChildren.length > 0 || useThemePaletteGradient ? /* @__PURE__ */ jsxs("defs", { children: [
          useThemePaletteGradient ? /* @__PURE__ */ jsxs(
            "linearGradient",
            {
              id: themeActiveGradientId,
              x1: "0%",
              x2: "100%",
              y1: "0%",
              y2: "0%",
              children: [
                /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "var(--chart-1)" }),
                /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "var(--chart-5)" })
              ]
            }
          ) : null,
          defsChildren
        ] }) : null,
        notches.map((notch) => {
          const pathD = createNotchPath(
            notch.points,
            notchCornerRadius,
            cornerDepth
          );
          if (geometryScrubbing) {
            return /* @__PURE__ */ jsx(
              "path",
              {
                d: pathD,
                fill: resolveBgFill(notch.index),
                fillOpacity: resolvedInactiveFillOpacity
              },
              `bg-${notch.index}`
            );
          }
          return /* @__PURE__ */ jsx(
            motion.path,
            {
              animate: { opacity: 1, scale: 1 },
              d: pathD,
              fill: resolveBgFill(notch.index),
              fillOpacity: resolvedInactiveFillOpacity,
              initial: { opacity: 0, scale: 0 },
              style: {
                transformOrigin: `${notch.xCenter}px ${notch.yCenter}px`
              },
              transition: {
                ...notchTransition,
                delay: notch.index * 0.015 * stagger
              }
            },
            `bg-${notch.index}`
          );
        }),
        notches.filter((n) => n.isActive).map((notch) => {
          const pathD = createNotchPath(
            notch.points,
            notchCornerRadius,
            cornerDepth
          );
          if (geometryScrubbing) {
            return /* @__PURE__ */ jsx(
              "path",
              {
                d: pathD,
                fill: resolveActiveFill(notch),
                fillOpacity: resolvedActiveFillOpacity
              },
              `active-${notch.index}`
            );
          }
          return /* @__PURE__ */ jsx(
            motion.path,
            {
              animate: { opacity: 1, scale: 1 },
              d: pathD,
              fill: resolveActiveFill(notch),
              fillOpacity: resolvedActiveFillOpacity,
              initial: { opacity: 0, scale: 0 },
              style: {
                transformOrigin: `${notch.xCenter}px ${notch.yCenter}px`
              },
              transition: {
                ...notchTransition,
                delay: (0.3 + notch.index * 0.02) * stagger
              }
            },
            `active-${notch.index}`
          );
        })
      ]
    }
  );
}
function useGaugeFillState(props) {
  const {
    useGradient = false,
    activeGradient,
    inactiveGradient,
    inactiveFill,
    activeFill,
    inactiveFillOpacity,
    activeFillOpacity,
    children,
    totalNotches = 40
  } = props;
  const themeActiveGradientId = `gauge-theme-active-${useId().replace(/:/g, "")}`;
  const defsChildren = useMemo(
    () => collectGaugeDefsElements(children),
    [children]
  );
  const hasCustomInactive = inactiveFill !== void 0 && inactiveFill.length > 0;
  const hasCustomActive = activeFill !== void 0 && activeFill.length > 0;
  const activeGrad0 = activeGradient?.[0] ?? DEFAULT_ACTIVE_GRADIENT[0];
  const activeGrad1 = activeGradient?.[1] ?? DEFAULT_ACTIVE_GRADIENT[1];
  const inactiveGrad0 = inactiveGradient?.[0] ?? activeGrad0;
  const inactiveGrad1 = inactiveGradient?.[1] ?? activeGrad1;
  const useThemePaletteGradient = useGradient && activeGradient === void 0;
  return {
    themeActiveGradientId,
    defsChildren,
    hasCustomInactive,
    hasCustomActive,
    activeGrad0,
    activeGrad1,
    inactiveGrad0,
    inactiveGrad1,
    useThemePaletteGradient,
    resolvedActiveFillOpacity: activeFillOpacity ?? DEFAULT_ACTIVE_FILL_OPACITY,
    resolvedInactiveFillOpacity: inactiveFillOpacity ?? DEFAULT_INACTIVE_FILL_OPACITY,
    totalNotches
  };
}
function GaugeArcInner(props) {
  const {
    value,
    totalNotches = 40,
    spacing = 25,
    notchCornerRadius = 0,
    uniformWidth = false,
    width,
    height,
    startAngle = 135,
    endAngle = 405,
    useGradient = false,
    centerValue,
    defaultLabel = "Total",
    prefix,
    suffix,
    formatOptions = defaultChartStatFlowFormat,
    inactiveFill,
    activeFill,
    notchLengthPercent = 100,
    enterTransition,
    enterStaggerScale = 1
  } = props;
  const prefersReducedMotion = useReducedMotion();
  const fillState = useGaugeFillState(props);
  const notchTransition = prefersReducedMotion ? { duration: 0 } : enterTransition ?? DEFAULT_NOTCH_ENTER_TRANSITION;
  const stagger = Math.max(0.25, Math.min(2.5, enterStaggerScale));
  const size = Math.min(width, height);
  const centerX = width / 2;
  const centerY = height / 2;
  const outerRadius = size * 0.42;
  const innerRadiusBase = size * 0.28;
  const defaultRadialDepth = outerRadius - innerRadiusBase;
  const depthFactor = Math.min(100, Math.max(5, notchLengthPercent)) / 100;
  const notchLength = defaultRadialDepth * depthFactor;
  const innerRadius = outerRadius - notchLength;
  const activeNotches = Math.round(value / 100 * totalNotches);
  const totalAngle = endAngle - startAngle;
  const availableAngle = totalAngle * (1 - spacing / 100);
  const notchAngle = totalNotches > 0 ? availableAngle / totalNotches : 0;
  const gapDen = totalNotches - 1 > 0 ? totalNotches - 1 : 1;
  const gapAngle = totalAngle * (spacing / 100) / gapDen;
  const notches = useMemo(() => {
    return Array.from({ length: totalNotches }, (_, i) => {
      const angle = startAngle + i * (notchAngle + gapAngle) + notchAngle / 2;
      const radians = angle * Math.PI / 180;
      const arcNotchWidth = notchAngle * 0.8;
      const halfWidth = arcNotchWidth * Math.PI / 180 / 2;
      const x1 = centerX + Math.cos(radians - halfWidth) * outerRadius;
      const y1 = centerY + Math.sin(radians - halfWidth) * outerRadius;
      const x2 = centerX + Math.cos(radians + halfWidth) * outerRadius;
      const y2 = centerY + Math.sin(radians + halfWidth) * outerRadius;
      let x3;
      let y3;
      let x4;
      let y4;
      if (uniformWidth) {
        const perpX = Math.cos(radians);
        const perpY = Math.sin(radians);
        x3 = x2 - perpX * notchLength;
        y3 = y2 - perpY * notchLength;
        x4 = x1 - perpX * notchLength;
        y4 = y1 - perpY * notchLength;
      } else {
        x3 = centerX + Math.cos(radians + halfWidth) * innerRadius;
        y3 = centerY + Math.sin(radians + halfWidth) * innerRadius;
        x4 = centerX + Math.cos(radians - halfWidth) * innerRadius;
        y4 = centerY + Math.sin(radians - halfWidth) * innerRadius;
      }
      const denom = totalNotches > 1 ? totalNotches - 1 : 1;
      const gradientColor = useGradient && !fillState.useThemePaletteGradient ? interpolateGaugeHex(
        fillState.activeGrad0,
        fillState.activeGrad1,
        i / denom
      ) : "var(--chart-1)";
      return {
        index: i,
        points: { x1, y1, x2, y2, x3, y3, x4, y4 },
        isActive: i < activeNotches,
        gradientColor,
        xCenter: centerX,
        yCenter: centerY
      };
    });
  }, [
    totalNotches,
    notchAngle,
    gapAngle,
    centerX,
    centerY,
    outerRadius,
    innerRadius,
    activeNotches,
    startAngle,
    uniformWidth,
    notchLength,
    useGradient,
    fillState.useThemePaletteGradient,
    fillState.activeGrad0,
    fillState.activeGrad1
  ]);
  const resolveBgFill = (notchIndex) => resolveGaugeBgFill({
    notchIndex,
    totalNotches,
    hasCustomInactive: fillState.hasCustomInactive,
    inactiveFill,
    useThemePaletteGradient: fillState.useThemePaletteGradient,
    useGradient,
    inactiveGrad0: fillState.inactiveGrad0,
    inactiveGrad1: fillState.inactiveGrad1,
    arcTrackFill: "var(--border)",
    linearTrackFill: "var(--chart-background)",
    linearMode: false
  });
  const resolveActiveFill = (notch) => resolveGaugeActiveFill({
    notch,
    hasCustomActive: fillState.hasCustomActive,
    activeFill,
    useThemePaletteGradient: fillState.useThemePaletteGradient,
    themeActiveGradientId: fillState.themeActiveGradientId,
    useGradient,
    activeFillSolid: "var(--chart-1)"
  });
  const showCenter = centerValue != null;
  return /* @__PURE__ */ jsxs("div", { className: "relative w-full", style: { height, width }, children: [
    /* @__PURE__ */ jsx(
      GaugeNotchSvg,
      {
        cornerDepth: notchLength,
        defsChildren: fillState.defsChildren,
        geometryScrubbing: false,
        height,
        notchCornerRadius,
        notches,
        notchTransition,
        resolveActiveFill,
        resolveBgFill,
        resolvedActiveFillOpacity: fillState.resolvedActiveFillOpacity,
        resolvedInactiveFillOpacity: fillState.resolvedInactiveFillOpacity,
        stagger,
        themeActiveGradientId: fillState.themeActiveGradientId,
        useThemePaletteGradient: fillState.useThemePaletteGradient,
        width
      }
    ),
    showCenter ? /* @__PURE__ */ jsx(
      "div",
      {
        className: "pointer-events-none absolute inset-0 flex flex-col items-center justify-center",
        style: { paddingTop: size * 0.08 },
        children: /* @__PURE__ */ jsx(
          PieCenterShell,
          {
            centerValue,
            contextSize: size,
            defaultLabel,
            formatOptions,
            innerRadiusPx: Math.max(size * 0.2, 52),
            prefix,
            suffix
          }
        )
      }
    ) : null
  ] });
}
function GaugeLinearInner(props) {
  const {
    value,
    totalNotches = 40,
    spacing = 25,
    notchCornerRadius = 0,
    uniformWidth = true,
    width,
    height,
    useGradient = false,
    centerValue,
    defaultLabel = "Total",
    prefix,
    suffix,
    formatOptions = defaultChartStatFlowFormat,
    labelPlacement = "top",
    labelAlign = "start",
    inactiveFill,
    activeFill,
    notchLengthPercent = 100,
    notchWidthPercent = 80,
    enterTransition,
    enterStaggerScale = 1,
    geometryScrubbing = false
  } = props;
  const prefersReducedMotion = useReducedMotion();
  const fillState = useGaugeFillState(props);
  const notchTransition = prefersReducedMotion ? { duration: 0 } : enterTransition ?? DEFAULT_NOTCH_ENTER_TRANSITION;
  const stagger = Math.max(0.25, Math.min(2.5, enterStaggerScale));
  const centerY = height / 2;
  const depthFactor = Math.min(100, Math.max(5, notchLengthPercent)) / 100;
  const outerOffset = height / 2 * depthFactor;
  const taperRatio = 28 / 42;
  const innerOffset = uniformWidth ? outerOffset : outerOffset * taperRatio;
  const notchDepth = uniformWidth ? outerOffset * 2 : outerOffset - innerOffset;
  const cornerVerticalDepth = uniformWidth ? notchDepth : outerOffset * 2;
  const widthFactor = Math.min(100, Math.max(10, notchWidthPercent)) / 100;
  const activeNotches = Math.round(value / 100 * totalNotches);
  const availableWidth = width * (1 - spacing / 100);
  const slotWidth = totalNotches > 0 ? availableWidth / totalNotches : 0;
  const gapDen = totalNotches - 1 > 0 ? totalNotches - 1 : 1;
  const gapWidth = width * (spacing / 100) / gapDen;
  const notches = useMemo(() => {
    return Array.from({ length: totalNotches }, (_, i) => {
      const xCenter = i * (slotWidth + gapWidth) + slotWidth / 2;
      const halfWidth = slotWidth * widthFactor / 2;
      let x1;
      let y1;
      let x2;
      let y2;
      let x3;
      let y3;
      let x4;
      let y4;
      if (uniformWidth) {
        const halfHeight = notchDepth / 2;
        x1 = xCenter - halfWidth;
        y1 = centerY - halfHeight;
        x2 = xCenter + halfWidth;
        y2 = centerY - halfHeight;
        x3 = xCenter + halfWidth;
        y3 = centerY + halfHeight;
        x4 = xCenter - halfWidth;
        y4 = centerY + halfHeight;
      } else {
        x1 = xCenter - halfWidth;
        y1 = centerY - outerOffset;
        x2 = xCenter + halfWidth;
        y2 = centerY - outerOffset;
        const innerHalfWidth = halfWidth * (innerOffset / outerOffset);
        x3 = xCenter + innerHalfWidth;
        y3 = centerY + outerOffset;
        x4 = xCenter - innerHalfWidth;
        y4 = centerY + outerOffset;
      }
      const denom = totalNotches > 1 ? totalNotches - 1 : 1;
      const gradientColor = useGradient && !fillState.useThemePaletteGradient ? interpolateGaugeHex(
        fillState.activeGrad0,
        fillState.activeGrad1,
        i / denom
      ) : "var(--chart-1)";
      return {
        index: i,
        points: { x1, y1, x2, y2, x3, y3, x4, y4 },
        isActive: i < activeNotches,
        gradientColor,
        xCenter,
        yCenter: centerY
      };
    });
  }, [
    totalNotches,
    slotWidth,
    gapWidth,
    centerY,
    outerOffset,
    innerOffset,
    activeNotches,
    uniformWidth,
    notchDepth,
    widthFactor,
    useGradient,
    fillState.useThemePaletteGradient,
    fillState.activeGrad0,
    fillState.activeGrad1
  ]);
  const resolveBgFill = (notchIndex) => resolveGaugeBgFill({
    notchIndex,
    totalNotches,
    hasCustomInactive: fillState.hasCustomInactive,
    inactiveFill,
    useThemePaletteGradient: fillState.useThemePaletteGradient,
    useGradient,
    inactiveGrad0: fillState.inactiveGrad0,
    inactiveGrad1: fillState.inactiveGrad1,
    arcTrackFill: "var(--border)",
    linearTrackFill: "var(--chart-background)",
    linearMode: true
  });
  const resolveActiveFill = (notch) => resolveGaugeActiveFill({
    notch,
    hasCustomActive: fillState.hasCustomActive,
    activeFill,
    useThemePaletteGradient: fillState.useThemePaletteGradient,
    themeActiveGradientId: fillState.themeActiveGradientId,
    useGradient,
    activeFillSolid: "var(--chart-1)"
  });
  const label = centerValue == null ? null : /* @__PURE__ */ jsx(
    GaugeLabelShell,
    {
      align: labelAlign,
      centerValue,
      defaultLabel,
      formatOptions,
      prefix,
      suffix
    }
  );
  const track = /* @__PURE__ */ jsx("div", { className: "relative w-full", style: { height, width }, children: /* @__PURE__ */ jsx(
    GaugeNotchSvg,
    {
      cornerDepth: cornerVerticalDepth,
      defsChildren: fillState.defsChildren,
      geometryScrubbing,
      height,
      notchCornerRadius,
      notches,
      notchTransition,
      resolveActiveFill,
      resolveBgFill,
      resolvedActiveFillOpacity: fillState.resolvedActiveFillOpacity,
      resolvedInactiveFillOpacity: fillState.resolvedInactiveFillOpacity,
      stagger,
      themeActiveGradientId: fillState.themeActiveGradientId,
      useThemePaletteGradient: fillState.useThemePaletteGradient,
      width
    }
  ) });
  return /* @__PURE__ */ jsx(
    GaugeLabelLayout,
    {
      align: labelAlign,
      label,
      placement: labelPlacement,
      children: track
    }
  );
}
function GaugeInner(props) {
  if (props.orientation === "linear") {
    return /* @__PURE__ */ jsx(GaugeLinearInner, { ...props });
  }
  return /* @__PURE__ */ jsx(GaugeArcInner, { ...props });
}
function Gauge({
  width: widthProp,
  height: heightProp,
  className,
  minWidth,
  orientation = "arc",
  linearHeight,
  ...props
}) {
  const isLinear = orientation === "linear";
  const resolvedMinWidth = minWidth ?? (isLinear ? 200 : 300);
  const resolvedLinearHeight = linearHeight ?? DEFAULT_LINEAR_GAUGE_HEIGHT;
  if (isLinear) {
    if (widthProp != null) {
      return /* @__PURE__ */ jsx(
        "div",
        {
          className: cn("relative w-full max-w-full", className),
          style: { width: widthProp },
          children: /* @__PURE__ */ jsx(
            GaugeInner,
            {
              height: heightProp ?? resolvedLinearHeight,
              orientation: "linear",
              width: widthProp,
              ...props
            }
          )
        }
      );
    }
    return /* @__PURE__ */ jsx("div", { className: cn("relative w-full min-w-0 max-w-full", className), children: /* @__PURE__ */ jsx("div", { className: "w-full min-w-0", style: { minWidth: resolvedMinWidth }, children: /* @__PURE__ */ jsx(ParentSize, { debounceTime: 10, children: ({ width }) => width > 0 ? /* @__PURE__ */ jsx(
      GaugeInner,
      {
        height: resolvedLinearHeight,
        orientation: "linear",
        width,
        ...props
      }
    ) : null }) }) });
  }
  if (widthProp != null && heightProp != null) {
    return /* @__PURE__ */ jsx("div", { className: cn("relative inline-flex max-w-full", className), children: /* @__PURE__ */ jsx(
      GaugeInner,
      {
        height: heightProp,
        orientation: "arc",
        width: widthProp,
        ...props
      }
    ) });
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn("relative w-full max-w-full", className),
      style: { minWidth: resolvedMinWidth },
      children: /* @__PURE__ */ jsx("div", { className: "mx-auto aspect-[21/16] w-full max-w-[560px]", children: /* @__PURE__ */ jsx(ParentSize, { debounceTime: 10, children: ({ width, height }) => width > 0 && height > 0 ? /* @__PURE__ */ jsx(
        GaugeInner,
        {
          height,
          orientation: "arc",
          width,
          ...props
        }
      ) : null }) })
    }
  );
}
Gauge.displayName = "Gauge";
export {
  Gauge
};
