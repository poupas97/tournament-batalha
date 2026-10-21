import Detail from "@/components/Detail";
import { formatDateTime } from "@/lib/date";
import { PlayerBEResponse } from "@/types/team";
import { Paper, Stack, Typography } from "@mui/material";

type DetailsPlayerProps = {
  loading: boolean;
  error: string | undefined;
  player: PlayerBEResponse | undefined;
};

export default function DetailsPlayer({
  loading,
  error,
  player,
}: DetailsPlayerProps) {
  const eventsByMatch = Object.values(
    (player?.events ?? []).reduce<Record<string, PlayerBEResponse["events"]>>(
      (groups, event) => {
        const matchId = String(event.matchId);
        groups[matchId] ??= [];
        groups[matchId].push(event);
        return groups;
      },
      {},
    ),
  ).sort(
    (first, second) =>
      new Date(second[0].match.date).getTime() -
      new Date(first[0].match.date).getTime(),
  );

  return (
    <>
      <Detail<PlayerBEResponse>
        loading={loading}
        error={error}
        data={player}
        fields={[
          { key: "photo", label: "Foto", format: "photo" },
          { key: "name", label: "Nome" },
          { key: "number", label: "Número" },
          { key: "team.name", label: "Equipa" },
          { key: "team.competition.name", label: "Competição" },
        ]}
      />

      {player && !loading && !error && (
        <Stack spacing={2} sx={{ mt: 3 }}>
          <Typography variant="h6">Eventos por jogo</Typography>
          {eventsByMatch.length ? (
            eventsByMatch.map((matchEvents) => {
              const match = matchEvents[0].match;

              return (
                <Paper key={match.id} variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1">
                    {match.homeTeam?.name ?? "A definir"} –{" "}
                    {match.awayTeam?.name ?? "A definir"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {match.round} · {formatDateTime(match.date)}
                  </Typography>
                  <Stack spacing={0.5} sx={{ mt: 1 }}>
                    {matchEvents.map((it) => (
                      <Typography key={it.id} variant="body2">
                        {it.minute}' - {it.type}
                      </Typography>
                    ))}
                  </Stack>
                </Paper>
              );
            })
          ) : (
            <Typography variant="body2" color="text.secondary">
              Ainda não há eventos registados para este jogador.
            </Typography>
          )}
        </Stack>
      )}
    </>
  );
}
