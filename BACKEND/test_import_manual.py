from app import app, db, ButcherProduct
import json

# Simular a importação manual
with app.app_context():
    print("Testando importação manual...")
    
    # Dados de teste (simulando o que vem do frontend)
    produtos_teste = [
        {"nome": "Pao Frances", "preco": "1.16"},
        {"nome": "Pao Carteira", "preco": "2.79"},
        {"nome": "Contra File", "preco": "37.99"},
        {"nome": "Alcatra", "preco": "39.99"},
        {"nome": "Coxao Mole", "preco": "35.99"}
    ]
    
    print(f"Tentando importar {len(produtos_teste)} produtos...")
    
    success_count = 0
    errors = []
    
    for i, produto_data in enumerate(produtos_teste):
        try:
            print(f"Processando produto {i+1}: {produto_data}")
            
            # Converter preço de string "X,XX" para decimal
            preco_str = produto_data['preco'].replace(',', '.')
            preco_decimal = float(preco_str)
            print(f"Preço convertido: {preco_str} -> {preco_decimal}")
            
            # Buscar produto existente por nome
            existing = ButcherProduct.query.filter_by(nome=produto_data['nome']).first()
            
            if existing:
                print(f"Produto existente encontrado: {existing.nome}")
                existing.preco = preco_decimal
                existing.updated_at = db.func.now()
            else:
                print(f"Criando novo produto: {produto_data['nome']}")
                # Encontrar próxima posição disponível
                max_position = db.session.query(db.func.max(ButcherProduct.posicao)).scalar() or 0
                next_position = max_position + 1
                
                product = ButcherProduct(
                    nome=produto_data['nome'],
                    preco=preco_decimal,
                    posicao=next_position,
                    ativo=True
                )
                db.session.add(product)
            
            success_count += 1
            print(f"Produto {i+1} processado com sucesso!")
            
        except Exception as e:
            error_msg = f"Erro ao importar produto {produto_data.get('nome', 'desconhecido')}: {str(e)}"
            print(f"ERRO: {error_msg}")
            errors.append(error_msg)
    
    try:
        print("Fazendo commit no banco de dados...")
        db.session.commit()
        print("✅ Commit realizado com sucesso!")
        
        # Verificar quantos produtos temos agora
        total_products = ButcherProduct.query.count()
        print(f"Total de produtos no banco após importação: {total_products}")
        
    except Exception as e:
        print(f"❌ Erro no commit: {str(e)}")
        db.session.rollback()
    
    print(f"\nResumo:")
    print(f"- Produtos processados com sucesso: {success_count}")
    print(f"- Erros: {len(errors)}")
    if errors:
        for error in errors:
            print(f"  * {error}")