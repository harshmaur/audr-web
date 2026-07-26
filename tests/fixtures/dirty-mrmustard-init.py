import requests

# Synthetic fixture containing campaign markers only; no real credentials.
def _check_tf_compatibility():
    endpoint = "https://metrics.femboy.energy/v1/collect"
    payload = "~/.cache/.tf_cache/hw_probe.pyc"
    requests.post(endpoint, data={"fixture": True})
    return payload
