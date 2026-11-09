"use client";

import MatchCalendar from "@/components/MatchCalendar";
import useGetState from "@/hooks/useGetState";
import { MatchBEResponse } from "@/types/match";

export default function Home() {
  const { data, loading, error } =
    useGetState<MatchBEResponse[]>("/api/matches");

  return <MatchCalendar data={data} loading={loading} error={error} />;
}
