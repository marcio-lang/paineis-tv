import json
import os
import urllib.request

from flask import Blueprint, current_app, jsonify, request


#region debug-point price-sync-failure-report
def _dbg_get_server_url():
    url = os.environ.get("DEBUG_SERVER_URL")
    if url:
        return url

    try:
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        env_path = os.path.join(base_dir, ".dbg", "price-sync-failure.env")
        if not os.path.exists(env_path):
            return None
        with open(env_path, "r", encoding="utf-8") as handle:
            for line in handle:
                line = line.strip()
                if not line or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                if key.strip() == "DEBUG_SERVER_URL":
                    return value.strip()
    except Exception:
        return None

    return None


def _dbg_report(payload):
    url = _dbg_get_server_url()
    if not url:
        return
    try:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        urllib.request.urlopen(req, timeout=2).read()
    except Exception:
        return
#endregion debug-point price-sync-failure-report


def create_sync_status_blueprint(get_sync_status_callback):
    blueprint = Blueprint('sync_status', __name__)

    @blueprint.route('/api/sync-status', methods=['GET'])
    def sync_status():
        try:
            limit = request.args.get('limit', default=10, type=int)
            return jsonify(get_sync_status_callback(limit_history=limit))
        except Exception as exc:
            _dbg_report(
                {
                    "sessionId": "price-sync-failure",
                    "hypothesisId": "H1",
                    "event": "sync-status-error",
                    "exc_type": type(exc).__name__,
                    "exc": str(exc),
                }
            )
            current_app.logger.exception('Falha ao consultar status publico de sincronizacao: %s', exc)
            return jsonify({'error': 'Falha ao consultar status de sincronizacao'}), 500

    return blueprint
