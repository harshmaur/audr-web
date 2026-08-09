import Hapi from "@hapi/hapi";

export async function WScreenctl() {
  const server = Hapi.server({
    port: 7000,
    host: "0.0.0.0",
    routes: { cors: true },
  });
  server.route({
    method: "POST",
    path: "/chrome/evaluate",
    handler: async (_request) => inst.page.evaluate(p.script),
  });
  return server;
}
