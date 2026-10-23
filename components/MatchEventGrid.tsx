"use client";

import { MatchBEResponse } from "@/types/match";
import { Box, Grid, Typography } from "@mui/material";
import PlayerIdentity from "@/components/PlayerIdentity";
import StaffIdentity from "@/components/StaffIdentity";

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
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h6">Elementos equipa: {team?.name}</Typography>

      <Grid container spacing={1}>
        {team?.players.map((it) => (
          <Grid
            key={`player-${it.id}`}
            size={4}
            onClick={addPlayerMatchEvent(it.id, team.id)}
            sx={{
              p: 1,
              backgroundColor: "lightblue",
              borderRadius: 1,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 1,
              minWidth: 0,
            }}
          >
            <PlayerIdentity player={it} size="large" showNumber />
          </Grid>
        ))}

        {team?.staffs.map((it) => (
          <Grid
            key={`staff-${it.id}`}
            size={4}
            onClick={addStaffMatchEvent(it.id, team.id)}
            sx={{
              p: 1,
              backgroundColor: "lightgreen",
              borderRadius: 1,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 1,
              minWidth: 0,
            }}
          >
            <StaffIdentity staff={it} size="large" />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
