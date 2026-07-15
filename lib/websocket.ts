import { SocketEvents } from "@/enums/socket";

type Handler = (payload: unknown) => void;

let socket: WebSocket | null = null;
const listeners = new Map<SocketEvents, Set<Handler>>();

export function getSocket() {
  if (!socket || socket.readyState === WebSocket.CLOSED) {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";

    socket = new WebSocket(`${protocol}://${window.location.host}/api/ws`);
  }

  return socket;
}

export function sendSocketMessage(message: unknown) {
  const currentSocket = getSocket();
  const data = JSON.stringify(message);

  if (currentSocket.readyState === WebSocket.OPEN) {
    currentSocket.send(data);

    return () => {};
  }

  const onOpen = () => {
    currentSocket.send(data);
  };

  currentSocket.addEventListener("open", onOpen, { once: true });

  return () => {
    currentSocket.removeEventListener("open", onOpen);
  };
}

export function onSocket(type: SocketEvents, handler: Handler) {
  let handlers = listeners.get(type);

  if (!handlers) {
    handlers = new Set();

    listeners.set(type, handlers);
  }

  handlers.add(handler);

  return () => {
    handlers?.delete(handler);
  };
}

export function dispatchSocketMessage(event: MessageEvent) {
  const message = JSON.parse(event.data);

  const handlers = listeners.get(message.type);

  if (!handlers) return;

  for (const handler of handlers) {
    handler(message.payload);
  }
}
