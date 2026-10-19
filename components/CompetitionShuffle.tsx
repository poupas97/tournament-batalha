import { getCompetitionShuffleView } from "@/lib/competition/standings";
import { formatDateTime } from "@/lib/date";
import {
  getMatchScore,
  getMatchStatusColor,
  isMatchFinished,
} from "@/lib/match";
import {
  CompetitionBEResponse,
  CompetitionForShuffle,
  CompetitionShuffleGroup,
  LeagueStanding,
} from "@/types/competition";
import { MatchBEResponse } from "@/types/match";
import {
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Link from "next/link";

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
  const { homeGoals, awayGoals } = getMatchScore(match);
  const showScore = isMatchFinished(match.status);
  const statusColor = getMatchStatusColor(match.status);

  return (
    <Grid
      size={{ xs: 12, sm: isKnockoutMatch ? 12 : 4 }}
      component={Link}
      href={`${isBackoffice ? "/backoffice" : ""}/matches/${match.id}`}
      sx={{ alignContent: "center", textDecoration: "auto" }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2,
          cursor: "pointer",
          height: isKnockoutMatch ? undefined : "100%",
          display: "flex",
          flexDirection: "column",

          "&:hover": { boxShadow: 2 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body2" color="text.secondary" noWrap>
            {match.round}
          </Typography>

          <Typography variant="body2" color="text.secondary" noWrap>
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
            flex: 1,
          }}
        >
          <Typography
            variant="body1"
            sx={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}
          >
            {match.homeTeam?.name ?? match.homePlaceholder ?? "-"}
          </Typography>

          <Typography variant="body1" sx={{ flexShrink: 0 }}>
            {showScore ? `${homeGoals} - ${awayGoals}` : "vs"}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              flex: 1,
              minWidth: 0,
              textAlign: "right",
              overflowWrap: "anywhere",
            }}
          >
            {match.awayTeam?.name ?? match.awayPlaceholder ?? "-"}
          </Typography>
        </Box>

        <Typography variant="body1" align="center" sx={{ color: statusColor }}>
          <Box
            component="span"
            sx={{
              display: "inline-block",
              width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor: statusColor,
              mr: 1,
            }}
          />
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
    <Paper sx={{ width: "100%", minWidth: 0, overflow: "hidden" }}>
      <TableContainer>
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
            {standings.map((team) => (
              <TableRow
                key={team.team.id}
                sx={{
                  backgroundColor: qualifiedTeamIds?.has(team.team.id)
                    ? "success.light"
                    : undefined,
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
                <TableCell sx={{ textAlign: "center" }}>
                  {team.points}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {team.played}
                </TableCell>
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
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
        <Grid key={group} size={{ xs: 12, sm: 6 }} sx={{ minWidth: 0 }}>
          <Typography variant="h6">Grupo {group}</Typography>
          <LeagueTable
            standings={standings}
            qualifiedTeamIds={qualifiedTeamIds}
            isBackoffice={isBackoffice}
          />
        </Grid>
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
        {matches.map((it) => (
          <MatchCard key={it.id} match={it} isBackoffice={isBackoffice} />
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
      {matches.map((it) => (
        <MatchCard key={it.id} match={it} isBackoffice={isBackoffice} />
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
    <Grid container spacing={2}>
      {rounds.map((matches, index) => (
        <Grid
          key={index}
          container
          spacing={2}
          size={{ xs: 12, sm: 12 / rounds.length }}
          sx={{ minWidth: 0 }}
        >
          {matches.map((it) => (
            <MatchCard
              key={it.id}
              match={it}
              isBackoffice={isBackoffice}
              isKnockoutMatch
            />
          ))}
        </Grid>
      ))}
    </Grid>
  );
}
