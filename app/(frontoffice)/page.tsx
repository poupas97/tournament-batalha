"use client";

import MatchCalendar from "@/components/MatchCalendar";
import useGetState from "@/hooks/useGetState";
import { MatchBEResponse } from "@/types/match";
import { Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const { data, loading, error } =
    useGetState<MatchBEResponse[]>("/api/matches");

  return (
    <>
      {loading && <Typography variant="body1">A carregar dados...</Typography>}

      {error && (
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      )}

      <MatchCalendar
        data={data}
        onMatchClick={(it) => router.push(`/matches/${it.id}`)}
      />
    </>
  );
}
