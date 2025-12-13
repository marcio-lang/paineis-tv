# Novas rotas para suportar múltiplos painéis

@app.route('/api/actions', methods=['POST'])
def create_action_multiple_panels():
    """Criar ação com múltiplos painéis"""
    data = request.get_json()
    
    try:
        action = Action(
            name=data['name'],
            start_date=datetime.fromisoformat(data['start_date'].replace('Z', '+00:00')),
            end_date=datetime.fromisoformat(data['end_date'].replace('Z', '+00:00'))
        )
        
        # Associar ação aos painéis especificados
        panel_ids = data.get('panel_ids', [])
        for panel_id in panel_ids:
            panel = Panel.query.get(panel_id)
            if panel:
                action.panels.append(panel)
        
        db.session.add(action)
        db.session.commit()
        
        return jsonify({
            'id': action.id,
            'name': action.name,
            'start_date': action.start_date.isoformat(),
            'end_date': action.end_date.isoformat(),
            'panels': [{'id': p.id, 'name': p.name} for p in action.panels],
            'created_at': action.created_at.isoformat(),
            'updated_at': action.updated_at.isoformat()
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/actions', methods=['GET'])
def get_all_actions():
    """Listar todas as ações"""
    actions = Action.query.all()
    
    return jsonify([{
        'id': action.id,
        'name': action.name,
        'start_date': action.start_date.isoformat(),
        'end_date': action.end_date.isoformat(),
        'panels': [{'id': p.id, 'name': p.name} for p in action.panels],
        'images_count': len(action.images),
        'created_at': action.created_at.isoformat(),
        'updated_at': action.updated_at.isoformat()
    } for action in actions])

@app.route('/api/actions/<action_id>/panels', methods=['POST'])
def add_action_to_panels(action_id):
    """Adicionar ação a painéis adicionais"""
    action = Action.query.get_or_404(action_id)
    data = request.get_json()
    
    try:
        panel_ids = data.get('panel_ids', [])
        
        for panel_id in panel_ids:
            panel = Panel.query.get(panel_id)
            if panel and panel not in action.panels:
                action.panels.append(panel)
        
        db.session.commit()
        
        return jsonify({
            'id': action.id,
            'name': action.name,
            'panels': [{'id': p.id, 'name': p.name} for p in action.panels]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/actions/<action_id>/panels/<panel_id>', methods=['DELETE'])
def remove_action_from_panel(action_id, panel_id):
    """Remover ação de um painel específico"""
    action = Action.query.get_or_404(action_id)
    panel = Panel.query.get_or_404(panel_id)
    
    try:
        if panel in action.panels:
            action.panels.remove(panel)
            db.session.commit()
        
        return jsonify({
            'id': action.id,
            'name': action.name,
            'panels': [{'id': p.id, 'name': p.name} for p in action.panels]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400