const SPRING_DEFAULT = {
  bounce: 0.1,
  duration: 0.25,
  type: "spring"
};
const SPRING_SNAPPY = {
  bounce: 0,
  duration: 0.2,
  type: "spring"
};
const EASE_OUT = [0.23, 1, 0.32, 1];
const EASE_IN_OUT = [0.645, 0.045, 0.355, 1];
const DURATION_INSTANT = { duration: 0 };
const DURATION = {
  complex: 0.4,
  default: 0.25,
  fast: 0.15,
  slow: 0.3
};
export {
  DURATION,
  DURATION_INSTANT,
  EASE_IN_OUT,
  EASE_OUT,
  SPRING_DEFAULT,
  SPRING_SNAPPY
};
