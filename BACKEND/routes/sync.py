from flask import Blueprint, current_app, jsonify, request

from services.price_sync_service import is_sync_token_valid, save_uploaded_sync_file


def create_sync_blueprint(schedule_import_callback, get_sync_token, get_upload_path, get_status_callback):
    blueprint = Blueprint("price_sync", __name__)

    @blueprint.route("/api/importar-precos", methods=["POST"])
    def import_prices():
        sync_token = get_sync_token()
        if not sync_token:
            current_app.logger.error("SYNC_TOKEN nao configurado para /api/importar-precos")
            return jsonify({"error": "Sincronizacao indisponivel"}), 503

        if not is_sync_token_valid(request.headers.get("Authorization"), sync_token):
            return jsonify({"error": "Token invalido"}), 401

        uploaded_file = request.files.get("file") or request.files.get("arquivo")
        if uploaded_file is None or not uploaded_file.filename:
            return jsonify({"error": "Arquivo nao enviado"}), 400

        try:
            saved_path, stored_filename = save_uploaded_sync_file(uploaded_file, get_upload_path())
            scheduled_job = schedule_import_callback(
                saved_path=saved_path,
                original_filename=uploaded_file.filename,
                stored_filename=stored_filename,
                source="sync_api",
            )
            return jsonify(
                {
                    "message": "Arquivo recebido e importacao agendada",
                    "job_id": scheduled_job["job_id"],
                    "filename": stored_filename,
                    "status": scheduled_job["status"],
                }
            ), 202
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400
        except Exception as exc:
            current_app.logger.exception("Falha ao receber arquivo de sincronizacao: %s", exc)
            return jsonify({"error": "Falha ao receber arquivo"}), 500

    @blueprint.route("/api/importar-precos/status", methods=["GET"])
    def import_prices_status():
        sync_token = get_sync_token()
        if not sync_token:
            current_app.logger.error("SYNC_TOKEN nao configurado para /api/importar-precos/status")
            return jsonify({"error": "Sincronizacao indisponivel"}), 503

        if not is_sync_token_valid(request.headers.get("Authorization"), sync_token):
            return jsonify({"error": "Token invalido"}), 401

        try:
            return jsonify(get_status_callback())
        except Exception as exc:
            current_app.logger.exception("Falha ao consultar status de sincronizacao: %s", exc)
            return jsonify({"error": "Falha ao consultar status"}), 500

    return blueprint
