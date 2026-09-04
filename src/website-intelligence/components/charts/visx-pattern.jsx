"use client";
import { jsx } from "react/jsx-runtime";
import {
  PatternCircles as VisxPatternCircles,
  PatternHexagons as VisxPatternHexagons,
  PatternLines as VisxPatternLines,
  PatternWaves as VisxPatternWaves
} from "@visx/pattern";
function PatternLines(props) {
  return /* @__PURE__ */ jsx(VisxPatternLines, { ...props });
}
PatternLines.displayName = "PatternLines";
function PatternCircles(props) {
  return /* @__PURE__ */ jsx(VisxPatternCircles, { ...props });
}
PatternCircles.displayName = "PatternCircles";
function PatternWaves(props) {
  return /* @__PURE__ */ jsx(VisxPatternWaves, { ...props });
}
PatternWaves.displayName = "PatternWaves";
function PatternHexagons(props) {
  return /* @__PURE__ */ jsx(VisxPatternHexagons, { ...props });
}
PatternHexagons.displayName = "PatternHexagons";
export {
  PatternCircles,
  PatternHexagons,
  PatternLines,
  PatternWaves
};
