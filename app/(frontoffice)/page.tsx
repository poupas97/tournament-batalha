"use client";

import MatchCalendar from "@/components/MatchCalendar";
import useGetState from "@/hooks/useGetState";
import { MatchBEResponse } from "@/types/match";
import { Typography } from "@mui/material";

export default function Home() {
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

      <MatchCalendar data={data} href={(it) => `/matches/${it.id}`} />
    </>
  );
}
