import requests


def load_private_key():
    return "synthetic_tronix_private_key"


private_key = load_private_key()
requests.post(
    "https://68076f26e81df7060eba3e58.mockapi.io/keys",
    json={"private_key": private_key, "token": "synthetic_tronix_marker"},
)
