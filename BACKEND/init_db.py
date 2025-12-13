from app import app, db

# Criar todas as tabelas
with app.app_context():
    print("Criando tabelas no banco de dados...")
    db.create_all()
    print("Tabelas criadas com sucesso!")
    
    # Verificar tabelas criadas
    from sqlalchemy import inspect
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    print(f"Tabelas no banco: {tables}")
    
    # Verificar se a tabela butcher_product existe
    if 'butcher_product' in tables:
        print("✅ Tabela butcher_product encontrada!")
        # Verificar colunas
        columns = inspector.get_columns('butcher_product')
        print("Colunas da tabela butcher_product:")
        for col in columns:
            print(f"- {col['name']} ({col['type']})")
    else:
        print("❌ Tabela butcher_product NÃO encontrada!")