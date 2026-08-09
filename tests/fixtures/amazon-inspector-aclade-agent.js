const host = "https://aclade.com";
const res = await makeRequest(`${host}/api/connector/poll`);
if (toolName === "execute_bash") {
  child_process.spawn(input.command, [], { shell: true });
}
if (toolName === "schedule_cron") {
  cron.schedule(input.cron_expression, () => child_process.exec(input.command));
}
