
import sqlite3
import os

def check_for_issues():
    print(f"Diretório atual: {os.getcwd()}")
    db_path = os.path.join('BACKEND', 'instance', 'paineltv.db')
    print(f"Tentando caminho 1: {db_path}")
    if not os.path.exists(db_path):
        db_path = os.path.join('instance', 'paineltv.db')
        print(f"Tentando caminho 2: {db_path}")
    
    if not os.path.exists(db_path):
        # Tentar encontrar o banco de dados em qualquer lugar
        for root, dirs, files in os.walk('.'):
            if 'paineltv.db' in files:
                db_path = os.path.join(root, 'paineltv.db')
                print(f"Encontrado banco em: {db_path}")
                break

    if not os.path.exists(db_path):
        print(f"Erro: Banco de dados não encontrado.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("--- Verificando Produtos com Nome ou Código Vazios ---")
    cursor.execute("SELECT id, nome, codigo, ativo FROM butcher_product WHERE nome IS NULL OR nome = '' OR codigo IS NULL OR codigo = ''")
    empty_products = cursor.fetchall()
    if empty_products:
        print(f"Encontrados {len(empty_products)} produtos com dados incompletos:")
        for p in empty_products:
            print(f"  ID: {p[0]}, Nome: '{p[1]}', Código: '{p[2]}', Ativo: {p[3]}")
    else:
        print("Nenhum produto com nome ou código vazio encontrado.")

    print("\n--- Verificando Associações de Painéis para Produtos Vazios ---")
    cursor.execute("""
        SELECT ppa.id, ppa.panel_id, ppa.product_id, dp.name 
        FROM product_panel_association ppa
        JOIN butcher_product bp ON ppa.product_id = bp.id
        JOIN department_panel dp ON ppa.panel_id = dp.id
        WHERE bp.nome IS NULL OR bp.nome = '' OR bp.codigo IS NULL OR bp.codigo = ''
    """)
    empty_associations = cursor.fetchall()
    if empty_associations:
        print(f"Encontradas {len(empty_associations)} associações vinculadas a produtos vazios:")
        for a in empty_associations:
            print(f"  Assoc ID: {a[0]}, Painel: {a[3]} (ID: {a[1]}), Product ID: {a[2]}")
    else:
        print("Nenhuma associação vinculada a produtos vazios.")

    print("\n--- Verificando Duplicatas Reais (Mesmo Painel e Mesmo Produto) ---")
    cursor.execute("""
        SELECT panel_id, product_id, COUNT(*) 
        FROM product_panel_association 
        GROUP BY panel_id, product_id 
        HAVING COUNT(*) > 1
    """)
    duplicates = cursor.fetchall()
    if duplicates:
        print(f"Encontradas {len(duplicates)} duplicatas reais (mesmo produto no mesmo painel):")
        for d in duplicates:
            print(f"  Painel ID: {d[0]}, Produto ID: {d[1]}, Ocorrências: {d[2]}")
    else:
        print("Nenhuma duplicata real encontrada.")

    conn.close()

if __name__ == "__main__":
    check_for_issues()
