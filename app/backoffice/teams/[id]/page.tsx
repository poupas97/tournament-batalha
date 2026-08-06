"use client";

import DetailsTeam from "@/components/DetailsTeam";
import Title from "@/components/Title";
import useGetState from "@/hooks/useGetState";
import { TeamBEResponse } from "@/types/team";
import { useParams } from "next/navigation";

export default function ViewTeamPage() {
  const params = useParams();
  const teamId = params?.id;

  const { data, loading, error } = useGetState<TeamBEResponse>(
    teamId ? `/api/backoffice/teams/${teamId}` : undefined,
  );

  return (
    <>
      <Title
        label="Ver equipa"
        back
        edit={`/backoffice/teams/${teamId}/edit`}
      />

      <DetailsTeam team={data} loading={loading} error={error} />
    </>
  );
}
