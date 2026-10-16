export const RELATIVE_LUMINANCE_WEIGHTS = {
  red: 0.2126,
  green: 0.7152,
  blue: 0.0722,
} as const;

export const DARK_TEXT_LUMINANCE_THRESHOLD = 0.179;

export const SRGB_LINEARIZATION = {
  threshold: 0.03928,
  divisor: 12.92,
  offset: 0.055,
  scale: 1.055,
  exponent: 2.4,
} as const;
