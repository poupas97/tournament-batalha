import { MatchStatus } from "@/generated/prisma";
import { getCompetitionShuffleView, getMatchScore } from "@/lib/shuffle";
import { formatDateTime } from "@/lib/utils";
import {
  CompetitionBEResponse,
  CompetitionShuffleGroup,
  LeagueStanding,
} from "@/types/competition";
import { CompetitionForShuffle } from "@/types/competition";
import { MatchBEResponse } from "@/types/match";
import {
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CompetitionShuffle({
  competition,
  matches,
  isBackoffice = false,
}: {
  competition: CompetitionBEResponse;
  matches: MatchBEResponse[];
  isBackoffice?: boolean;
}) {
  if (!competition.config) {
    return (
      <Typography variant="body1">
        Esta competição ainda não tem configuração.
      </Typography>
    );
  }

  const configuredCompetition: CompetitionForShuffle = {
    ...competition,
    config: competition.config,
  };
  const view = getCompetitionShuffleView(configuredCompetition, matches);

  return (
    <>
      <Typography variant="h5">Classificação</Typography>
      {view.isGroupCompetition ? (
        <GroupTables
          groups={view.groups}
          qualifiedTeamIds={view.qualifiedTeamIds}
          isBackoffice={isBackoffice}
        />
      ) : (
        <LeagueTable
          standings={view.standings}
          qualifiedTeamIds={view.qualifiedTeamIds}
          isBackoffice={isBackoffice}
        />
      )}

      <Typography variant="h5">Jornadas</Typography>
      {view.isGroupCompetition ? (
        <GroupSchedule groups={view.groups} isBackoffice={isBackoffice} />
      ) : (
        <LeagueSchedule
          matches={view.leagueMatches}
          isBackoffice={isBackoffice}
        />
      )}

      <Typography variant="h5">Eliminatórias</Typography>
      <KnockoutBracket
        rounds={view.knockoutRounds}
        isBackoffice={isBackoffice}
      />
    </>
  );
}

function MatchCard({
  match,
  isBackoffice,
  isKnockoutMatch,
}: {
  match: MatchBEResponse;
  isBackoffice: boolean;
  isKnockoutMatch?: boolean;
}) {
  const router = useRouter();

  const { homeGoals, awayGoals } = getMatchScore(match);
  const showScore =
    match.status === MatchStatus.RT_END ||
    match.status === MatchStatus.ET_END ||
    match.status === MatchStatus.PENALTIES;

  return (
    <Grid size={isKnockoutMatch ? 12 : 4}>
      <Paper
        elevation={0}
        onClick={() => {
          router.push(
            `${isBackoffice ? "/backoffice" : ""}/matches/${match.id}`,
          );
        }}
        sx={{
          p: 2,
          cursor: "pointer",
          height: isKnockoutMatch ? undefined : "100%",

          "&:hover": { borderColor: "primary.main", boxShadow: 2 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="caption" color="text.secondary" noWrap>
            {match.round}
          </Typography>

          <Typography variant="caption" color="text.secondary" noWrap>
            {formatDateTime(match.date)}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mt: 2,
            mb: 2,
          }}
        >
          <Typography variant="body2" sx={{ flex: 1 }}>
            {match.homeTeam?.name ?? match.homePlaceholder ?? "-"}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              minWidth: 50,
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
          >
            {showScore ? `${homeGoals} - ${awayGoals}` : "vs"}
          </Typography>

          <Typography variant="body2" sx={{ flex: 1, textAlign: "right" }}>
            {match.awayTeam?.name ?? match.awayPlaceholder ?? "-"}
          </Typography>
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          align="center"
          sx={{ display: "block", flex: 1 }}
        >
          {match.status}
        </Typography>
      </Paper>
    </Grid>
  );
}

function LeagueTable({
  standings,
  qualifiedTeamIds,
  isBackoffice,
}: {
  standings: LeagueStanding[];
  qualifiedTeamIds?: Set<number>;
  isBackoffice: boolean;
}) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell sx={{ width: "5%" }}>º</TableCell>
          <TableCell>Equipa</TableCell>
          <TableCell sx={{ width: "5%" }}>P</TableCell>
          <TableCell sx={{ width: "5%" }}>J</TableCell>
          <TableCell sx={{ width: "5%" }}>V</TableCell>
          <TableCell sx={{ width: "5%" }}>E</TableCell>
          <TableCell sx={{ width: "5%" }}>D</TableCell>
          <TableCell sx={{ width: "5%" }}>GM</TableCell>
          <TableCell sx={{ width: "5%" }}>GS</TableCell>
          <TableCell sx={{ width: "5%" }}>DG</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {standings.map((team) => {
          const isQualified = qualifiedTeamIds?.has(team.team.id);

          return (
            <TableRow
              key={team.team.id}
              sx={{
                background: isQualified ? "#dcfce7" : undefined,
                color: isQualified ? "#166534" : undefined,
              }}
            >
              <TableCell sx={{ textAlign: "center" }}>
                {team.position}
              </TableCell>
              <TableCell>
                <Link
                  href={
                    isBackoffice
                      ? `/backoffice/teams/${team.team.id}`
                      : `/teams/${team.team.id}`
                  }
                >
                  {team.team.name}
                </Link>
              </TableCell>
              <TableCell sx={{ textAlign: "center" }}>{team.points}</TableCell>
              <TableCell sx={{ textAlign: "center" }}>{team.played}</TableCell>
              <TableCell sx={{ textAlign: "center" }}>{team.won}</TableCell>
              <TableCell sx={{ textAlign: "center" }}>{team.drawn}</TableCell>
              <TableCell sx={{ textAlign: "center" }}>{team.lost}</TableCell>
              <TableCell sx={{ textAlign: "center" }}>
                {team.goalsFor}
              </TableCell>
              <TableCell sx={{ textAlign: "center" }}>
                {team.goalsAgainst}
              </TableCell>
              <TableCell sx={{ textAlign: "center" }}>
                {team.goalDifference}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function GroupTables({
  groups,
  qualifiedTeamIds,
  isBackoffice,
}: {
  groups: CompetitionShuffleGroup[];
  qualifiedTeamIds: Set<number>;
  isBackoffice: boolean;
}) {
  return (
    <Grid container spacing={2}>
      {groups.map(({ group, standings }) => (
        <Box key={group}>
          <Typography variant="h6">Grupo {group}</Typography>
          <LeagueTable
            standings={standings}
            qualifiedTeamIds={qualifiedTeamIds}
            isBackoffice={isBackoffice}
          />
        </Box>
      ))}
    </Grid>
  );
}

function GroupSchedule({
  groups,
  isBackoffice,
}: {
  groups: CompetitionShuffleGroup[];
  isBackoffice: boolean;
}) {
  return groups.map(({ group, matches }) => (
    <Box key={group}>
      <Typography variant="h6">Grupo {group}</Typography>

      <Grid container spacing={2}>
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} isBackoffice={isBackoffice} />
        ))}
      </Grid>
    </Box>
  ));
}

function LeagueSchedule({
  matches,
  isBackoffice,
}: {
  matches: MatchBEResponse[];
  isBackoffice: boolean;
}) {
  return (
    <Grid container spacing={2}>
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} isBackoffice={isBackoffice} />
      ))}
    </Grid>
  );
}

function KnockoutBracket({
  rounds,
  isBackoffice,
}: {
  rounds: MatchBEResponse[][];
  isBackoffice: boolean;
}) {
  if (!rounds.length) {
    return (
      <Typography variant="body1">Sem emparelhamento disponível.</Typography>
    );
  }

  return (
    <Grid container spacing={4}>
      {rounds.map((matches, index) => (
        <Grid key={index} container spacing={2} size={12 / rounds.length}>
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              isBackoffice={isBackoffice}
              isKnockoutMatch
            />
          ))}
        </Grid>
      ))}
    </Grid>
  );
}
