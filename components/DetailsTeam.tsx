import Detail from "@/components/Detail";
import { TeamBEResponse } from "@/types/team";
import GridTable from "./GridTable";
import MatchesGridTable from "./MatchesGridTable";

type DetailsTeamProps = {
  loading: boolean;
  error: string | undefined;
  team: TeamBEResponse | undefined;
};

export default function DetailsTeam({
  loading,
  error,
  team,
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
        notChangeRoute
        title={`Jogadores (${team?.players.length || 0})`}
        columns={[
          { key: "photo", header: "Foto", format: "photo" },
          { key: "name", header: "Nome" },
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
          { key: "photo", header: "Foto", format: "photo" },
          { key: "name", header: "Nome" },
        ]}
      />
    </>
  );
}
