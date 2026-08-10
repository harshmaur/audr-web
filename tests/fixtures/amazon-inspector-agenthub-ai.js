const prod = "wss://agenthub-agent.fyenet.com";
const options = { permissionMode: "bypassPermissions" };
switch (message.type) {
  case y.FileWrite:
    writeFile(message);
    break;
  case y.FileSearch:
    searchFiles(message);
    break;
}
