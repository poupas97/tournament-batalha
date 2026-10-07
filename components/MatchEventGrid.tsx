"use client";

import { MatchBEResponse } from "@/types/match";
import { Box, Grid, Typography } from "@mui/material";

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
    <Box sx={{ flex: 1 }}>
      <Typography variant="h6">Elementos equipa: {team?.name}</Typography>
      <Grid container spacing={1}>
        {team?.players.map((it) => (
          <Grid
            size={4}
            key={it.id}
            onClick={addPlayerMatchEvent(it.id, team.id)}
            sx={{
              p: 1,
              backgroundColor: "lightblue",
              borderRadius: 1,
              cursor: "pointer",
            }}
          >
            {it.number} - {it.name}
          </Grid>
        ))}

        {team?.staffs.map((it) => (
          <Grid
            size={4}
            key={it.id}
            onClick={addStaffMatchEvent(it.id, team.id)}
            sx={{
              p: 1,
              backgroundColor: "lightgreen",
              borderRadius: 1,
              cursor: "pointer",
            }}
          >
            {it.name}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
