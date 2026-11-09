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
    teamId ? `/api/teams/${teamId}` : undefined,
  );

  return (
    <>
      <Title label="Ver equipa" back />

      <DetailsTeam loading={loading} error={error} team={data} />
    </>
  );
}
