import { joinMatch, leaveMatch } from "@/lib/socket";
import { SocketEvents } from "@/enums/socket";
import {
  experimental_upgradeWebSocket,
  WebSocketData,
} from "@vercel/functions";

export function GET() {
  return experimental_upgradeWebSocket((ws) => {
    console.log("Client connected");

    let currentMatchId: number | null = null;

    ws.on("message", (data: WebSocketData) => {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case SocketEvents.JOIN:
          currentMatchId = Number(message.matchId);
          joinMatch(currentMatchId, ws);

          break;

        case SocketEvents.LEAVE:
          if (currentMatchId !== null) {
            leaveMatch(currentMatchId, ws);
            currentMatchId = null;
          }

          break;
      }
    });

    ws.on("close", () => {
      if (currentMatchId !== null) {
        leaveMatch(currentMatchId, ws);
      }

      console.log("Client disconnected");
    });
  });
}
