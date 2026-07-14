let socket: WebSocket | null = null;

export function getSocket() {
  if (!socket || socket.readyState === WebSocket.CLOSED) {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";

    socket = new WebSocket(`${protocol}://${window.location.host}/api/ws`);
  }

  return socket;
}
