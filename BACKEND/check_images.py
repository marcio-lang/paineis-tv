from app import app, db, Action, ActionImage

with app.app_context():
    print(f'Total de ações: {Action.query.count()}')
    print(f'Total de imagens: {ActionImage.query.count()}')
    
    # Verificar uma ação específica
    action = Action.query.first()
    if action:
        print(f'Primeira ação "{action.name}" tem {len(action.images)} imagens')
        
        # Verificar se há alguma ação com muitas imagens
        actions_with_images = Action.query.all()
        for act in actions_with_images:
            if len(act.images) > 0:
                print(f'Ação "{act.name}" (ID: {act.id}) tem {len(act.images)} imagens')
    else:
        print('Nenhuma ação encontrada')