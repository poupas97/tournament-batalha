"use client";

import DetailsPlayer from "@/components/DetailsPlayer";
import Title from "@/components/Title";
import useGetState from "@/hooks/useGetState";
import { PlayerBEResponse } from "@/types/team";
import { useParams } from "next/navigation";

export default function ViewPlayerPage() {
  const params = useParams();
  const playerId = params?.id;

  const { data, loading, error } = useGetState<PlayerBEResponse>(
    `/api/players/${playerId}`,
  );

  return (
    <>
      <Title label="Ver jogador" back />

      <DetailsPlayer loading={loading} error={error} player={data} />
    </>
  );
}
