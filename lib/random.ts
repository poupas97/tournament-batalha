import _random from "lodash/random";

export function getRandomSuffix() {
  return _random(0, Number.MAX_SAFE_INTEGER).toString(36);
}
