"use client";

import { useMemo, useState } from "react";
import { Box, IconButton, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { MatchBEResponse } from "@/types/match";
import {
  formatMonth,
  formatCalendarDay,
  formatTime,
  getCalendarDays,
  getLocalDateKey,
  isSameDay,
  isSameMonth,
} from "@/lib/date";
import { getContrastText } from "@/lib/match";
import { WEEK_DAYS } from "@/constants/competition";
import Link from "next/link";

type MatchCalendarProps = {
  data: MatchBEResponse[] | undefined;
  href: (match: MatchBEResponse) => string;
};

export default function MatchCalendar({ data, href }: MatchCalendarProps) {
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
    return matchesByDay.get(getLocalDateKey(day)) ?? [];
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
      <Box
        sx={(theme) => ({
          width: "100%",
          display: "block",
          [theme.breakpoints.down("sm")]: { display: "none" },
        })}
      >
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
                size={12 / 7}
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
                      component={Link}
                      href={href(match)}
                      sx={{
                        borderRadius: 1,
                        bgcolor: match.competition?.color,
                        color: getContrastText(match.competition?.color),
                        cursor: "pointer",
                        overflow: "hidden",
                        justifyItems: "center",
                        textDecoration: "auto",
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

      <Stack
        spacing={1.5}
        sx={(theme) => ({
          display: "none",
          p: 1,
          [theme.breakpoints.down("sm")]: { display: "flex" },
        })}
      >
        {calendarDays
          .filter(
            (day) => isSameMonth(day, currentDate) && getDayMatches(day).length,
          )
          .map((day) => (
            <Box key={day.toISOString()}>
              <Typography
                variant="subtitle2"
                color={isSameDay(day, todayDate) ? "primary" : "text.secondary"}
                sx={{ mb: 0.75, textTransform: "capitalize" }}
              >
                {formatCalendarDay(day)}
              </Typography>
              <Stack spacing={0.75}>
                {getDayMatches(day).map((match) => (
                  <Box
                    component={Link}
                    href={href(match)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      p: 1,
                      borderRadius: 1,
                      bgcolor: match.competition?.color,
                      color: getContrastText(match.competition?.color),
                      cursor: "pointer",
                      textDecoration: "auto",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ flex: 1, minWidth: 0 }}
                      noWrap
                    >
                      {match.homeTeam?.name ?? "A definir"}
                    </Typography>
                    <Stack
                      spacing={0}
                      sx={{ flexShrink: 0, alignItems: "center" }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ whiteSpace: "nowrap" }}
                      >
                        {formatTime(match.date)}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ whiteSpace: "nowrap" }}
                      >
                        {match.round}
                      </Typography>
                    </Stack>
                    <Typography
                      variant="body2"
                      sx={{ flex: 1, minWidth: 0, textAlign: "right" }}
                      noWrap
                    >
                      {match.awayTeam?.name ?? "A definir"}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          ))}
        {!calendarDays.some(
          (day) => isSameMonth(day, currentDate) && getDayMatches(day).length,
        ) && (
          <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
            Não há jogos neste mês.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}
