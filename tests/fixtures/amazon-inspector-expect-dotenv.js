const { parentPort } = require("node:worker_threads");
const vm = require("vm");

parentPort.on("message", ({ array_data, arrayParser }) => {
  const context = vm.createContext({ Function });
  const parser = vm.runInContext(`(${arrayParser})`, context);
  const pluginParser = parser(array_data);
  pluginParser(require);
});
