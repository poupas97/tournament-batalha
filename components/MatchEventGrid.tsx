"use client";

import { MatchBEResponse } from "@/types/match";
import { Box, Grid } from "@mui/material";
import TeamIdentity from "@/components/TeamIdentity";
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
    <Box sx={{ flex: 1 }}>
      <TeamIdentity team={team} size="large" />
      <Grid container spacing={1}>
        {team?.players.map((it) => (
          <Grid
            size={{ xs: 12, sm: 6 }}
            key={it.id}
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
            <PlayerIdentity player={it} size="large" />
          </Grid>
        ))}

        {team?.staffs.map((it) => (
          <Grid
            size={{ xs: 12, sm: 6 }}
            key={it.id}
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
