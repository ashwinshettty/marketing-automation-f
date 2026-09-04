"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
const Skeleton = ({ loading = true, children, className }) => {
  if (!loading && children) {
    return /* @__PURE__ */ jsx(Fragment, { children });
  }
  if (loading && children) {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        "aria-busy": "true",
        "aria-live": "polite",
        className: cn("relative", className),
        children: [
          /* @__PURE__ */ jsx("div", { className: "invisible", children }),
          /* @__PURE__ */ jsx(
            "div",
            {
              "aria-hidden": "true",
              className: "absolute inset-0 animate-pulse rounded-[inherit] bg-muted-foreground/20"
            }
          )
        ]
      }
    );
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      "aria-busy": "true",
      className: cn(
        "animate-pulse rounded-md bg-muted-foreground/20",
        className
      )
    }
  );
};
var stdin_default = Skeleton;
export {
  stdin_default as default
};
