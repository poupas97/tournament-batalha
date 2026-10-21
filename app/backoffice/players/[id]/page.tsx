"use client";

import DetailsPlayer from "@/components/DetailsPlayer";
import Title from "@/components/Title";
import useGetState from "@/hooks/useGetState";
import { PlayerBEResponse } from "@/types/team";
import { useParams } from "next/navigation";
import { CompetitionStatus } from "@/generated/prisma";

export default function BackofficeViewPlayerPage() {
  const params = useParams();
  const playerId = params?.id;

  const { data, loading, error } = useGetState<PlayerBEResponse>(
    `/api/backoffice/players/${playerId}`,
  );

  return (
    <>
      <Title
        label="Ver jogador"
        description="Consulte os dados deste jogador"
        back
        edit={
          data?.team.competition.status === CompetitionStatus.DRAFT
            ? `/backoffice/players/${playerId}/edit`
            : undefined
        }
      />

      <DetailsPlayer loading={loading} error={error} player={data} />
    </>
  );
}
