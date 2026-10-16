import { MATCH_STATE_MACHINE } from "@/enums/matches";
import { Match, MatchEventType, MatchStatus } from "@/generated/prisma";
import { isKnockoutRound } from "@/lib/competition/rounds";
import { MatchBEResponse } from "@/types/match";
import {
  DARK_TEXT_LUMINANCE_THRESHOLD,
  RELATIVE_LUMINANCE_WEIGHTS,
  SRGB_LINEARIZATION,
} from "@/constants/colors";

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
    RELATIVE_LUMINANCE_WEIGHTS.red * toLinear(red) +
    RELATIVE_LUMINANCE_WEIGHTS.green * toLinear(green) +
    RELATIVE_LUMINANCE_WEIGHTS.blue * toLinear(blue);

  return luminance > DARK_TEXT_LUMINANCE_THRESHOLD
    ? "var(--app-foreground)"
    : "#ffffff";
}

function toLinear(channel: number) {
  return channel <= SRGB_LINEARIZATION.threshold
    ? channel / SRGB_LINEARIZATION.divisor
    : ((channel + SRGB_LINEARIZATION.offset) / SRGB_LINEARIZATION.scale) **
        SRGB_LINEARIZATION.exponent;
}

export function getMatchScore(match: MatchBEResponse | undefined) {
  if (!match) {
    return { homeGoals: 0, awayGoals: 0 };
  }

  let homeGoals = 0;
  let awayGoals = 0;

  if (!match.homeTeamId || !match.awayTeamId) {
    return { homeGoals, awayGoals };
  }

  for (const event of match.events ?? []) {
    switch (event.type) {
      case MatchEventType.GOAL:
      case MatchEventType.PENALTY_GOAL:
        if (event.teamId === match.homeTeamId) homeGoals++;
        if (event.teamId === match.awayTeamId) awayGoals++;
        break;

      case MatchEventType.OWN_GOAL:
        if (event.teamId === match.homeTeamId) awayGoals++;
        if (event.teamId === match.awayTeamId) homeGoals++;
        break;
    }
  }

  return { homeGoals, awayGoals };
}

export function getMatchStatusColor(status: MatchStatus) {
  switch (status) {
    case MatchStatus.SCHEDULED:
      return "primary.main";

    case MatchStatus.RT_START:
    case MatchStatus.RT_HALF_TIME:
    case MatchStatus.RT_RESTART:
    case MatchStatus.ET_START:
    case MatchStatus.ET_HALF_TIME:
    case MatchStatus.ET_RESTART:
    case MatchStatus.PENALTIES_START:
      return "success.main";

    case MatchStatus.RT_END:
    case MatchStatus.ET_END:
    case MatchStatus.PENALTIES_END:
      return "text.secondary";

    case MatchStatus.INTERRUPTED:
    case MatchStatus.POSTPONED:
      return "warning.main";

    case MatchStatus.CANCELED:
      return "error.main";

    default:
      return "text.secondary";
  }
}

export function isMatchFinished(status: MatchStatus) {
  return (
    status === MatchStatus.RT_END ||
    status === MatchStatus.ET_END ||
    status === MatchStatus.PENALTIES_END
  );
}
