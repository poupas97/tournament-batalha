"use client";

import { MatchBEResponse } from "@/types/match";

type MatchEventGridProps = {
  team: MatchBEResponse["homeTeam"] | MatchBEResponse["awayTeam"];
  addPlayerMatchEvent: (playerId: number, teamId: number) => () => void;
  addStaffMatchEvent: (staffId: number, teamId: number) => () => void;
};

export default function MatchEventGrid({
  team,
  addPlayerMatchEvent,
  addStaffMatchEvent,
}: MatchEventGridProps) {
  return (
    <div style={{ flex: 1 }}>
      <h3>Equipa: {team?.name}</h3>
      <div
        style={{
          flex: 2,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1rem",
        }}
      >
        {team?.players.map((it) => (
          <div
            key={it.id}
            onClick={addPlayerMatchEvent(it.id, team.id)}
            style={{
              cursor: "pointer",
              border: "0.05rem solid black",
              backgroundColor: "aqua",
            }}
          >
            {it.number} - {it.name}
          </div>
        ))}
        {team?.staffs.map((it) => (
          <div
            key={it.id}
            onClick={addStaffMatchEvent(it.id, team.id)}
            style={{
              cursor: "pointer",
              border: "0.05rem solid black",
              backgroundColor: "greenyellow",
            }}
          >
            {it.name}
          </div>
        ))}
      </div>
    </div>
  );
}
