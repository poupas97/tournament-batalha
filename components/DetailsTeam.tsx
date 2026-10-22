import Detail from "@/components/Detail";
import { TeamBEResponse } from "@/types/team";
import GridTable from "./GridTable";
import MatchesGridTable from "./MatchesGridTable";
import PlayerIdentity from "./PlayerIdentity";
import StaffIdentity from "./StaffIdentity";

type DetailsTeamProps = {
  loading: boolean;
  error: string | undefined;
  team: TeamBEResponse | undefined;
  isBackoffice?: boolean;
};

export default function DetailsTeam({
  loading,
  error,
  team,
  isBackoffice,
}: DetailsTeamProps) {
  return (
    <>
      <Detail<TeamBEResponse>
        loading={loading}
        error={error}
        data={team}
        fields={[
          { key: "photo", label: "Logo", format: "photo" },
          { key: "name", label: "Nome" },
          { key: "competition.name", label: "Competição" },
        ]}
      />

      <MatchesGridTable
        loading={loading}
        error={error}
        data={[...(team?.awayMatches || []), ...(team?.homeMatches || [])].sort(
          (a, b) => (a.date > b.date ? 1 : -1),
        )}
        title="Jogos"
      />

      <GridTable
        loading={loading}
        error={error}
        data={team?.players || []}
        href={(it) => `${isBackoffice ? "/backoffice" : ""}/players/${it.id}`}
        notChangeRoute
        title={`Jogadores (${team?.players.length || 0})`}
        columns={[
          {
            key: "name",
            header: "Nome",
            render: (it) => <PlayerIdentity player={it} showNumber={false} />,
          },
          { key: "number", header: "Nº" },
        ]}
      />

      <GridTable
        loading={loading}
        error={error}
        data={team?.staffs || []}
        notChangeRoute
        title={`Staffs (${team?.staffs.length || 0})`}
        columns={[
          {
            key: "name",
            header: "Nome",
            render: (it) => <StaffIdentity staff={it} />,
          },
        ]}
      />
    </>
  );
}
