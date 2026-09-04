import { jsx, jsxs } from "react/jsx-runtime";
import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import { cn } from "@/lib/utils";
function Progress({
  className,
  children,
  value,
  ...props
}) {
  return /* @__PURE__ */ jsxs(
    ProgressPrimitive.Root,
    {
      value,
      "data-slot": "progress",
      className: cn("flex flex-wrap gap-3", className),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsx(ProgressTrack, { children: /* @__PURE__ */ jsx(ProgressIndicator, {}) })
      ]
    }
  );
}
function ProgressTrack({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    ProgressPrimitive.Track,
    {
      className: cn(
        "relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted",
        className
      ),
      "data-slot": "progress-track",
      ...props
    }
  );
}
function ProgressIndicator({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    ProgressPrimitive.Indicator,
    {
      "data-slot": "progress-indicator",
      className: cn("h-full bg-primary transition-all", className),
      ...props
    }
  );
}
function ProgressLabel({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    ProgressPrimitive.Label,
    {
      className: cn("text-sm font-medium", className),
      "data-slot": "progress-label",
      ...props
    }
  );
}
function ProgressValue({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    ProgressPrimitive.Value,
    {
      className: cn(
        "ml-auto text-sm text-muted-foreground tabular-nums",
        className
      ),
      "data-slot": "progress-value",
      ...props
    }
  );
}
export {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue
};
