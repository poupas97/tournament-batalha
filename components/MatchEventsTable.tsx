"use client";

import { MatchBEResponse } from "@/types/match";
import { MatchEventBEResponse } from "@/types/match-event";
import PhotoAvatar from "@/components/PhotoAvatar";
import PlayerIdentity from "@/components/PlayerIdentity";
import StaffIdentity from "@/components/StaffIdentity";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  Stack,
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

      <TableContainer>
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

                  <TableCell width="18%" align="right">
                    {isHomeEvent ? it.type : null}
                  </TableCell>
                  <TableCell width="30%">
                    {isHomeEvent ? (
                      it.player ? (
                        <PlayerIdentity
                          player={it.player}
                         
                          imageAtEnd
                        />
                      ) : it.staff ? (
                        <StaffIdentity staff={it.staff} imageAtEnd />
                      ) : null
                    ) : null}
                  </TableCell>

                  <TableCell width="4%" align="center">
                    {`${it.minute}'`}
                  </TableCell>

                  <TableCell width="30%" align="right">
                    {!isHomeEvent ? (
                      it.player ? (
                        <PlayerIdentity player={it.player} />
                      ) : it.staff ? (
                        <StaffIdentity staff={it.staff} />
                      ) : null
                    ) : null}
                  </TableCell>
                  <TableCell width="18%">
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
      </TableContainer>
    </>
  );
}
