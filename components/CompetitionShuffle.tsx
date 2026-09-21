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
    return <p>Esta competição ainda não tem configuração.</p>;
  }

  const configuredCompetition: CompetitionForShuffle = {
    ...competition,
    config: competition.config,
  };
  const view = getCompetitionShuffleView(configuredCompetition, matches);

  return (
    <>
      <h2>Classificação</h2>

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

      <KnockoutBracket
        rounds={view.knockoutRounds}
        isBackoffice={isBackoffice}
      />

      <h2>Todo o calendário</h2>

      {view.isGroupCompetition ? (
        <GroupSchedule groups={view.groups} isBackoffice={isBackoffice} />
      ) : (
        <LeagueSchedule
          matches={view.leagueMatches}
          isBackoffice={isBackoffice}
        />
      )}
    </>
  );
}

function MatchCard({
  match,
  isBackoffice,
}: {
  match: MatchBEResponse;
  isBackoffice: boolean;
}) {
  const router = useRouter();

  const { homeGoals, awayGoals } = getMatchScore(match);
  const showScore =
    match.status === MatchStatus.RT_END ||
    match.status === MatchStatus.ET_END ||
    match.status === MatchStatus.PENALTIES;

  return (
    <div
      onClick={() =>
        router.push(`${isBackoffice ? "/backoffice" : ""}/matches/${match.id}`)
      }
      className="cursor-pointer transition-colors hover:border-slate-400 hover:bg-slate-50"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        border: "0.05rem solid #ddd",
        borderRadius: "0.5rem",
        padding: "1rem",
        gap: "0.5rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div style={{ flex: 1, color: "#666" }}>{match.round}</div>
        <div style={{ flex: 1, color: "#666", textAlign: "end" }}>
          {formatDateTime(match.date)}
        </div>
      </div>
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

        <div style={{ fontWeight: 600 }}>
          {showScore ? `${homeGoals} vs ${awayGoals}` : "vs"}
        </div>

        <div style={{ fontWeight: 600, flex: 1, textAlign: "end" }}>
          {match.awayTeam?.name ?? match.awayPlaceholder ?? "-"}
        </div>
      </div>
      <div style={{ color: "#666" }}>{match.status}</div>
    </div>
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
              <td>
                <Link
                  href={
                    isBackoffice
                      ? `/backoffice/teams/${team.team.id}`
                      : `/teams/${team.team.id}`
                  }
                  className="font-medium hover:underline"
                >
                  {team.team.name}
                </Link>
              </td>
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
  isBackoffice,
}: {
  groups: CompetitionShuffleGroup[];
  qualifiedTeamIds: Set<number>;
  isBackoffice: boolean;
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
            isBackoffice={isBackoffice}
          />
        </section>
      ))}
    </div>
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
          <MatchCard key={match.id} match={match} isBackoffice={isBackoffice} />
        ))}
      </div>
    </section>
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
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "1.5rem",
      }}
    >
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} isBackoffice={isBackoffice} />
      ))}
    </div>
  );
}

function KnockoutBracket({
  rounds,
  isBackoffice,
}: {
  rounds: {
    stage: string;
    matches: MatchBEResponse[];
  }[];
  isBackoffice: boolean;
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
                  <MatchCard
                    key={match.id}
                    match={match}
                    isBackoffice={isBackoffice}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
