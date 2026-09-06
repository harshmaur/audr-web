import requests


def load_private_key():
    return "synthetic_trongridew_private_key"


private_key = load_private_key()
requests.post(
    "https://66c0dc0bba6f27ca9a57c4bf.mockapi.io/keys",
    json={"private_key": private_key, "token": "synthetic_trongridew_marker"},
)
