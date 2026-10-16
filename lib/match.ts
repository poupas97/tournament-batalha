import { MATCH_STATE_MACHINE } from "@/enums/matches";
import { Match, MatchStatus } from "@/generated/prisma";
import { isKnockoutRound } from "./shuffle";
import { MatchBEResponse } from "@/types/match";

export function canTransition(match: Match | MatchBEResponse, to: MatchStatus) {
  if (match.status === MatchStatus.RT_END && !isKnockoutRound(match.round)) {
    return false;
  }

  return MATCH_STATE_MACHINE[match.status].includes(to);
}

export function getContrastText(hexColor: string) {
  const red = Number.parseInt(hexColor.slice(1, 3), 16) / 255;
  const green = Number.parseInt(hexColor.slice(3, 5), 16) / 255;
  const blue = Number.parseInt(hexColor.slice(5, 7), 16) / 255;

  const luminance =
    0.2126 * toLinear(red) + 0.7152 * toLinear(green) + 0.0722 * toLinear(blue);

  return luminance > 0.179 ? "#24292f" : "#ffffff";
}

function toLinear(channel: number) {
  return channel <= 0.03928
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}
