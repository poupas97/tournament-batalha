"use client";

import { useMemo, useState } from "react";
import { Box, IconButton, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { MatchBEResponse } from "@/types/match";
import {
  formatMonth,
  formatTime,
  getCalendarDays,
  isSameDay,
  isSameMonth,
} from "@/lib/utils";

type MatchCalendarProps = {
  data: MatchBEResponse[] | undefined;
  onMatchClick: (match: MatchBEResponse) => void;
};

const WEEK_DAYS = [
  "segunda",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sábado",
  "domingo",
];

export default function MatchCalendar({
  data,
  onMatchClick,
}: MatchCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const todayDate = new Date();

  const calendarDays = useMemo(
    () => getCalendarDays(currentDate),
    [currentDate],
  );

  const matchesByDay = useMemo(() => {
    const map = new Map<string, MatchBEResponse[]>();

    for (const match of data ?? []) {
      const [datePart] = match.date?.split("T");

      if (!datePart) {
        continue;
      }

      const matches = map.get(datePart) ?? [];

      matches.push(match);
      map.set(datePart, matches);
    }

    for (const matches of map.values()) {
      matches.sort((a, b) => a.date.localeCompare(b.date));
    }

    return map;
  }, [data]);

  function getDayMatches(day: Date) {
    const key = `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`;

    return matchesByDay.get(key) ?? [];
  }

  function previousMonth() {
    setCurrentDate((current) => {
      return new Date(current.getFullYear(), current.getMonth() - 1, 1);
    });
  }

  function nextMonth() {
    setCurrentDate((current) => {
      return new Date(current.getFullYear(), current.getMonth() + 1, 1);
    });
  }

  return (
    <Paper>
      {/* TOOLBAR */}
      <Stack
        direction="row"
        sx={{
          padding: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          justifyContent: "space-between",
        }}
      >
        <IconButton onClick={previousMonth}>
          <ChevronLeftIcon />
        </IconButton>

        <Typography variant="h6">{formatMonth(currentDate)}</Typography>

        <IconButton onClick={nextMonth}>
          <ChevronRightIcon />
        </IconButton>
      </Stack>

      {/* CALENDAR */}
      <Box sx={{ width: "100%" }}>
        {/* WEEK DAYS */}
        <Grid
          container
          sx={{ borderBottom: "1px solid", borderColor: "divider" }}
        >
          {WEEK_DAYS.map((day) => (
            <Grid
              key={day}
              size="grow"
              sx={{
                py: 1,
                textAlign: "center",
                borderLeft: "1px solid",
                borderColor: "divider",
                "&:first-of-type": {
                  borderLeft: 0,
                },
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {/* DAYS */}
        <Grid container>
          {calendarDays.map((day) => {
            const dayMatches = getDayMatches(day);

            const isToday = isSameDay(day, todayDate);
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <Grid
                key={day.toISOString()}
                size={{ xs: 12 / 7 }}
                sx={{
                  padding: 1,
                  minWidth: 0,
                  minHeight: 140,
                  borderLeft: "1px solid",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  bgcolor: isCurrentMonth ? "background.paper" : "action.hover",

                  "&:nth-of-type(7n + 1)": {
                    borderLeft: 0,
                  },
                }}
              >
                {/* DAY HEADER */}
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}
                >
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      bgcolor: isToday ? "primary.main" : "transparent",
                      color: isToday
                        ? "primary.contrastText"
                        : isCurrentMonth
                          ? "text.primary"
                          : "text.disabled",
                    }}
                  >
                    <Typography variant="body2">{day.getDate()}</Typography>
                  </Box>
                </Box>

                {/* MATCHES */}
                <Stack spacing={1}>
                  {dayMatches.map((match) => (
                    <Box
                      key={match.id}
                      onClick={() => onMatchClick(match)}
                      sx={{
                        borderRadius: 1,
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        cursor: "pointer",
                        overflow: "hidden",
                        justifyItems: "center",

                        "&:hover": { bgcolor: "primary.dark" },
                      }}
                    >
                      <Typography variant="body1" align="center">
                        {match.homeTeam?.name ?? "A definir"}
                      </Typography>

                      <Typography variant="body2">vs</Typography>

                      <Typography variant="body1" align="center">
                        {match.awayTeam?.name ?? "A definir"}
                      </Typography>

                      <Typography variant="body2" sx={{ mt: 2 }}>
                        {match.round}
                      </Typography>

                      <Typography variant="body2">
                        {formatTime(match.date)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Paper>
  );
}
