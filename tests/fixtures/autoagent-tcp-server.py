import socket
import subprocess

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind(("0.0.0.0", args.port))
server.listen(1)
conn, addr = server.accept()
command = receive_all(conn)
modified_command = f"/bin/bash -c 'cd /{args.workplace} && {command}'"
process = subprocess.Popen(modified_command, shell=True, stdout=subprocess.PIPE)
