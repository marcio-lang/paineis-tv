from flask import Blueprint, current_app, jsonify, request


def create_sync_status_blueprint(get_sync_status_callback):
    blueprint = Blueprint('sync_status', __name__)

    @blueprint.route('/api/sync-status', methods=['GET'])
    def sync_status():
        try:
            limit = request.args.get('limit', default=10, type=int)
            return jsonify(get_sync_status_callback(limit_history=limit))
        except Exception as exc:
            current_app.logger.exception('Falha ao consultar status publico de sincronizacao: %s', exc)
            return jsonify({'error': 'Falha ao consultar status de sincronizacao'}), 500

    return blueprint
