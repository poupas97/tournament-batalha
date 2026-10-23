"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { MatchBEResponse } from "@/types/match";
import {
  formatTime,
  formatWeekRange,
  formatWeekDayAndDate,
  getLocalDateKey,
  getWeekDays,
  isSameDay,
} from "@/lib/date";
import { getContrastText } from "@/lib/match";
import Link from "next/link";
import TeamIdentity from "@/components/TeamIdentity";

type MatchCalendarProps = {
  data: MatchBEResponse[] | undefined;
  isBackoffice?: boolean;
};

export default function MatchCalendar({
  data,
  isBackoffice,
}: MatchCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const todayDate = new Date();
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  const matchesByDay = useMemo(() => {
    const map = new Map<string, MatchBEResponse[]>();

    for (const match of data ?? []) {
      const [datePart] = match.date?.split("T") ?? [];
      if (!datePart) continue;

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

  function moveWeek(amount: number) {
    setCurrentDate((current) => {
      const next = new Date(current);
      next.setDate(next.getDate() + amount * 7);
      return next;
    });
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  return (
    <Paper>
      <Stack
        direction="row"
        sx={{
          p: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <IconButton aria-label="Semana anterior" onClick={() => moveWeek(-1)}>
          <ChevronLeftIcon />
        </IconButton>

        <Typography variant="h6" sx={{ flex: 1 }}>
          {formatWeekRange(weekDays[0], weekDays[6])}
        </Typography>

        <Button onClick={goToToday} size="small">
          Hoje
        </Button>

        <IconButton aria-label="Semana seguinte" onClick={() => moveWeek(1)}>
          <ChevronRightIcon />
        </IconButton>
      </Stack>

      {/* Vista semanal para ecrãs maiores */}
      <Box
        sx={(theme) => ({
          display: "block",
          [theme.breakpoints.down("md")]: { display: "none" },
        })}
      >
        <Grid container>
          {weekDays.map((day) => {
            const matchesByDay = getDayMatches(day);
            const isToday = isSameDay(day, todayDate);

            return (
              <Grid
                key={getLocalDateKey(day)}
                size="grow"
                sx={{
                  p: 1,
                  minWidth: 0,
                  minHeight: 260,
                  borderLeft: "1px solid",
                  borderBottom: "1px solid",
                  borderColor: "divider",

                  "&:first-of-type": { borderLeft: 0 },
                }}
              >
                <Typography
                  variant="subtitle2"
                  color={isToday ? "primary" : "text.secondary"}
                  sx={{
                    mb: 1,
                    textAlign: "center",
                    textTransform: "capitalize",
                  }}
                >
                  {formatWeekDayAndDate(day)}
                </Typography>

                {matchesByDay.length ? (
                  <Stack spacing={1}>
                    {matchesByDay.map((it) => (
                      <Box
                        key={it.id}
                        component={Link}
                        href={`${isBackoffice ? "/backoffice" : ""}/matches/${it.id}`}
                        sx={{
                          display: "block",
                          p: 1,
                          borderRadius: 1,
                          bgcolor: it.competition?.color,
                          color: getContrastText(it.competition?.color),
                          cursor: "pointer",
                          overflow: "hidden",
                          textDecoration: "none",

                          "&:hover": { boxShadow: 2 },
                        }}
                      >
                        <Stack spacing={0.5}>
                          <TeamIdentity
                            team={it.homeTeam}
                            placeholder="A definir"
                            size="small"
                            vertical
                          />
                          <Typography variant="caption" align="center">
                            vs
                          </Typography>
                          <TeamIdentity
                            team={it.awayTeam}
                            placeholder="A definir"
                            size="small"
                            vertical
                          />
                          <Typography
                            variant="caption"
                            align="center"
                            sx={{ mt: 0.5 }}
                          >
                            {it.round} · {formatTime(it.date)}
                          </Typography>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                ) : null}
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Vista semanal em lista para tablets e telemóveis */}
      <Stack
        spacing={1.5}
        sx={(theme) => ({
          display: "none",
          p: 1.5,
          [theme.breakpoints.down("md")]: { display: "flex" },
        })}
      >
        {weekDays.map((day) => {
          const matchesByDay = getDayMatches(day);
          const isToday = isSameDay(day, todayDate);

          return (
            <Box key={getLocalDateKey(day)}>
              <Typography
                variant="subtitle2"
                color={isToday ? "primary" : "text.secondary"}
                sx={{ mb: 0.75, textTransform: "capitalize" }}
              >
                {formatWeekDayAndDate(day)}
              </Typography>
              {matchesByDay.length ? (
                <Stack spacing={0.75}>
                  {matchesByDay.map((it) => (
                    <Box
                      key={it.id}
                      component={Link}
                      href={`${isBackoffice ? "/backoffice" : ""}/matches/${it.id}`}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        p: 1,
                        borderRadius: 1,
                        bgcolor: it.competition?.color,
                        color: getContrastText(it.competition?.color),
                        cursor: "pointer",
                        textDecoration: "none",

                        "&:hover": { boxShadow: 2 },
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <TeamIdentity
                          team={it.homeTeam}
                          placeholder="A definir"
                          size="small"
                          vertical
                        />
                      </Box>
                      <Stack
                        spacing={0}
                        sx={{ flexShrink: 0, alignItems: "center" }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ whiteSpace: "nowrap" }}
                        >
                          {formatTime(it.date)}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ whiteSpace: "nowrap" }}
                        >
                          {it.round}
                        </Typography>
                      </Stack>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <TeamIdentity
                          team={it.awayTeam}
                          placeholder="A definir"
                          size="small"
                          vertical
                        />
                      </Box>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" align="center">
                  Sem jogos
                </Typography>
              )}
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
}
