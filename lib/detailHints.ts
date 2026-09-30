import {
  CompetitionConfig,
  CompetitionStatus,
  MatchStatus,
} from "@/generated/prisma";
import {
  CompetitionBEResponse,
  ICompetitionFormValues,
} from "@/types/competition";
import { MatchBEResponse } from "@/types/match";

function unavailableValueHint(value: unknown) {
  if (value === null || value === undefined) {
    return "Não foi definido nenhum valor para este campo";
  }

  return `Valor devolvido pela API: ${String(value)}`;
}

export function getCompetitionConfigHint(
  competition: CompetitionBEResponse | ICompetitionFormValues | undefined,
) {
  const { config } = competition || {};

  switch (config) {
    case CompetitionConfig.LEAGUE:
      return "LEAGUE: cada equipa joga contra o número definido de adversários";

    case CompetitionConfig.GROUP:
      return "GROUP: as equipas são distribuídas por grupos com o tamanho definido";

    default:
      return unavailableValueHint(config);
  }
}

export function getMatchCompetitionConfigHint(match: MatchBEResponse) {
  return getCompetitionConfigHint(match.competition);
}

export function getCompetitionQualifiedHint() {
  return "Número de equipas avançam para a fase eliminatória";
}

export function getMatchQualifiedHint() {
  return getCompetitionQualifiedHint();
}

export function getCompetitionOpponentsHint(
  competition: CompetitionBEResponse | ICompetitionFormValues | undefined,
) {
  const { config } = competition || {};

  if (config === CompetitionConfig.LEAGUE) {
    return "Cada equipa joga contra X adversários diferentes";
  }

  if (config === CompetitionConfig.GROUP) {
    return "Cada grupo é composto no máximo por X equipas";
  }

  return unavailableValueHint(config);
}

export function getMatchOpponentsHint(match: MatchBEResponse) {
  return getCompetitionOpponentsHint(match.competition);
}

export function getCompetitionStatusHint(competition: CompetitionBEResponse) {
  const { status } = competition;

  switch (status) {
    case CompetitionStatus.DRAFT:
      return "DRAFT: a competição ainda pode ser configurada antes do sorteio";

    case CompetitionStatus.DRAWN:
      return "DRAWN: o sorteio foi concluído e os jogos já foram gerados";

    case CompetitionStatus.IN_PROGRESS:
      return "IN_PROGRESS: a competição está a decorrer";

    case CompetitionStatus.FINISHED:
      return "FINISHED: a competição foi concluída";

    default:
      return unavailableValueHint(status);
  }
}

export function getMatchStatusHint(match: MatchBEResponse) {
  const { status } = match;

  switch (status) {
    case MatchStatus.SCHEDULED:
      return "SCHEDULED: o jogo está agendado e ainda não começou";

    case MatchStatus.RT_START:
      return "RT_START: a primeira parte está a decorrer";

    case MatchStatus.RT_HALF_TIME:
      return "RT_HALF_TIME: o jogo está no intervalo da primeira parte";

    case MatchStatus.RT_RESTART:
      return "RT_RESTART: a segunda parte está a decorrer";

    case MatchStatus.RT_END:
      return "RT_END: o tempo regulamentar terminou";

    case MatchStatus.ET_START:
      return "ET_START: a primeira parte do prolongamento está a decorrer";

    case MatchStatus.ET_HALF_TIME:
      return "ET_HALF_TIME: o jogo está no intervalo do prolongamento";

    case MatchStatus.ET_RESTART:
      return "ET_RESTART: a segunda parte do prolongamento está a decorrer";

    case MatchStatus.ET_END:
      return "ET_END: o prolongamento terminou";

    case MatchStatus.PENALTIES:
      return "PENALTIES: o vencedor está a ser decidido nos penáltis";

    case MatchStatus.INTERRUPTED:
      return "INTERRUPTED: o jogo foi interrompido e pode ser retomado";

    case MatchStatus.POSTPONED:
      return "POSTPONED: o jogo foi adiado";

    case MatchStatus.CANCELED:
      return "CANCELED: o jogo foi cancelado";

    default:
      return unavailableValueHint(status);
  }
}
