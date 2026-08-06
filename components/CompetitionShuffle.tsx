import { MatchStatus } from "@/generated/prisma";
import { getCompetitionShuffleView, getMatchScore } from "@/lib/shuffle";
import { formatDateTime } from "@/lib/utils";
import {
  CompetitionBEResponse,
  CompetitionShuffleGroup,
  LeagueStanding,
} from "@/types/competition";
import { MatchBEResponse } from "@/types/match";
import { useRouter } from "next/navigation";

export default function CompetitionShuffle({
  competition,
  matches,
}: {
  competition: CompetitionBEResponse;
  matches: MatchBEResponse[];
}) {
  const view = getCompetitionShuffleView(competition, matches);

  return (
    <>
      <h1>{competition.name}</h1>

      <h2>Classificação</h2>

      {view.isGroupCompetition ? (
        <GroupTables
          groups={view.groups}
          qualifiedTeamIds={view.qualifiedTeamIds}
        />
      ) : (
        <LeagueTable
          standings={view.standings}
          qualifiedTeamIds={view.qualifiedTeamIds}
        />
      )}

      <KnockoutBracket rounds={view.knockoutRounds} />

      <h2>Calendário</h2>

      {view.isGroupCompetition ? (
        <GroupSchedule groups={view.groups} />
      ) : (
        <ScheduleMatches matches={view.leagueMatches} />
      )}
    </>
  );
}

function MatchCard({ match }: { match: MatchBEResponse }) {
  const { homeGoals, awayGoals } = getMatchScore(match);
  const showScore =
    match.status === MatchStatus.RT_END ||
    match.status === MatchStatus.ET_END ||
    match.status === MatchStatus.PENALTIES;
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/backoffice/matches/${match.id}`)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        border: "0.05rem solid #ddd",
        borderRadius: "0.5rem",
        padding: "1rem",
        gap: "0.5rem",
        cursor: "pointer",
      }}
    >
      <div style={{ fontWeight: 600 }}>{formatDateTime(match.date)}</div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          width: "100%",
        }}
      >
        <div style={{ fontWeight: 600, flex: 1 }}>
          {match.homeTeam?.name ?? match.homePlaceholder ?? "-"}
        </div>

        <div style={{ color: "#666" }}>
          {showScore ? `${homeGoals} vs ${awayGoals}` : "vs"}
        </div>

        <div
          style={{
            fontWeight: 600,
            flex: 1,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          {match.awayTeam?.name ?? match.awayPlaceholder ?? "-"}
        </div>
      </div>
    </div>
  );
}

function LeagueTable({
  standings,
  qualifiedTeamIds,
}: {
  standings: LeagueStanding[];
  qualifiedTeamIds?: Set<number>;
}) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th>º</th>
          <th>Equipa</th>
          <th>P</th>
          <th>J</th>
          <th>V</th>
          <th>E</th>
          <th>D</th>
          <th>GM</th>
          <th>GS</th>
          <th>DG</th>
        </tr>
      </thead>

      <tbody>
        {standings.map((team) => {
          const isQualified = qualifiedTeamIds?.has(team.team.id);

          return (
            <tr
              key={team.team.id}
              style={{
                background: isQualified ? "#dcfce7" : undefined,
                color: isQualified ? "#166534" : undefined,
                fontWeight: isQualified ? 600 : undefined,
              }}
            >
              <td>{team.position}</td>
              <td>{team.team.name}</td>
              <td>{team.points}</td>
              <td>{team.played}</td>
              <td>{team.won}</td>
              <td>{team.drawn}</td>
              <td>{team.lost}</td>
              <td>{team.goalsFor}</td>
              <td>{team.goalsAgainst}</td>
              <td>{team.goalDifference}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function GroupTables({
  groups,
  qualifiedTeamIds,
}: {
  groups: CompetitionShuffleGroup[];
  qualifiedTeamIds: Set<number>;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "1.5rem",
      }}
    >
      {groups.map(({ group, standings }) => (
        <section key={group}>
          <h3>Grupo {group}</h3>
          <LeagueTable
            standings={standings}
            qualifiedTeamIds={qualifiedTeamIds}
          />
        </section>
      ))}
    </div>
  );
}

function GroupSchedule({ groups }: { groups: CompetitionShuffleGroup[] }) {
  return groups.map(({ group, matches }) => (
    <section key={group}>
      <h3>Grupo {group}</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "1.5rem",
        }}
      >
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </section>
  ));
}

function ScheduleMatches({ matches }: { matches: MatchBEResponse[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "1.5rem",
      }}
    >
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}

function KnockoutBracket({
  rounds,
}: {
  rounds: {
    stage: string;
    matches: MatchBEResponse[];
  }[];
}) {
  return (
    <>
      <h2>Fase Eliminatória</h2>

      {!rounds.length && <p>Sem emparelhamento disponível.</p>}

      {!!rounds.length && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${rounds.length}, minmax(0, 1fr))`,
            gap: "1.5rem",
            alignItems: "flex-start",
          }}
        >
          {rounds.map(({ stage, matches }) => (
            <div key={stage}>
              <h3>{stage}</h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                {matches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
