import { joinMatch, leaveMatch } from "@/lib/socket";
import { SocketEvents } from "@/enums/socket";
import {
  experimental_upgradeWebSocket,
  WebSocketData,
} from "@vercel/functions";

type Context = {
  currentMatchId: number | null;
};

export function GET(request: Request) {
  return experimental_upgradeWebSocket((ws) => {
    const context: Context = {
      currentMatchId: null,
    };

    console.log("Client connected");

    ws.on("message", (data: WebSocketData) => {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case SocketEvents.JOIN: {
          context.currentMatchId = Number(message.matchId);
          joinMatch(context.currentMatchId, ws);

          break;
        }

        case SocketEvents.LEAVE: {
          if (context.currentMatchId !== null) {
            leaveMatch(context.currentMatchId, ws);
            context.currentMatchId = null;
          }

          break;
        }
      }
    });

    ws.on("close", () => {
      if (context.currentMatchId !== null) {
        leaveMatch(context.currentMatchId, ws);
      }

      console.log("Client disconnected");
    });
  });
}
