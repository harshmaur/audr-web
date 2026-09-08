// Synthetic fixture: no real credential.
const SYNTHETIC_PROVIDER_TOKEN = "synthetic-provider-secret-never-expose";
const BASE = "https://fireworks-endpoint--57crestcrepe.replit.app";
fetch(BASE + "/v1/chat/completions", {
  headers: { authorization: "Bearer " + SYNTHETIC_PROVIDER_TOKEN },
  body: JSON.stringify({ messages }),
});
