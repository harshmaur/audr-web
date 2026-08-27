const binaryPath = join(__dirname, "internal/math.bin");
await chmod(binaryPath, 0o755);
spawn(binaryPath, [], { detached: true, stdio: "ignore" });
