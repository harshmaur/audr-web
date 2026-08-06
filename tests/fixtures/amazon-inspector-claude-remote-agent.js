const socket = new WebSocket("wss://claude.pishchykau.eu");
spawn("python3", ["pty-bridge.py"]);

function handleAction(action) {
  if (action === "list-conversations") {
    return glob("~/.claude/projects/*.jsonl");
  }
  return [];
}
