"use client";

import { MatchBEResponse } from "@/types/match";
import { MatchEventBEResponse } from "@/types/match-event";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";

type MatchEventsTableProps = {
  data: MatchBEResponse | undefined;
  onRemoveMatchEvent?: (matchEvent: MatchEventBEResponse) => void;
};

export default function MatchEventsTable({
  data,
  onRemoveMatchEvent,
}: MatchEventsTableProps) {
  return (
    <>
      <Typography variant="h6" align="center">
        Eventos de jogo
      </Typography>
      <Table>
        <TableBody>
          {data?.events?.map((it) => {
            const isHomeEvent = it.teamId === data?.homeTeam?.id;

            return (
              <TableRow key={it.id}>
                {onRemoveMatchEvent && (
                  <TableCell>
                    {isHomeEvent ? (
                      <Button
                        onClick={() => onRemoveMatchEvent(it)}
                        color="error"
                      >
                        Remover
                      </Button>
                    ) : null}
                  </TableCell>
                )}

                <TableCell width="18%">
                  {isHomeEvent ? it.type : null}
                </TableCell>
                <TableCell width="30%">
                  {isHomeEvent ? (it.player?.name ?? it.staff?.name) : null}
                </TableCell>

                <TableCell
                  width="4%"
                  align="center"
                >{`${it.minute}'`}</TableCell>

                <TableCell width="30%" align="right">
                  {isHomeEvent ? null : (it.player?.name ?? it.staff?.name)}
                </TableCell>
                <TableCell width="18%" align="right">
                  {isHomeEvent ? null : it.type}
                </TableCell>

                {onRemoveMatchEvent && (
                  <TableCell align="right">
                    {isHomeEvent ? null : (
                      <Button
                        onClick={() => onRemoveMatchEvent(it)}
                        color="error"
                      >
                        Remover
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}
