
import sqlite3
import os

def check_invalid_products():
    db_path = os.path.join('instance', 'paineltv.db')
    if not os.path.exists(db_path):
        db_path = os.path.join('..', 'instance', 'paineltv.db')
    if not os.path.exists(db_path):
        print(f"Erro: Banco de dados não encontrado em {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("--- Verificando produtos com campos inválidos ---")
    
    # Produtos com nome vazio ou nulo
    cursor.execute("SELECT id, codigo, nome FROM butcher_product WHERE (nome IS NULL OR nome = '' OR nome = ' ') AND ativo = 1")
    empty_names = cursor.fetchall()
    print(f"Produtos ativos com nome vazio/nulo: {len(empty_names)}")
    for p in empty_names:
        print(f"  ID: {p[0]}, Código: {p[1]}")

    # Produtos com código vazio ou nulo
    cursor.execute("SELECT id, nome FROM butcher_product WHERE (codigo IS NULL OR codigo = '') AND ativo = 1")
    empty_codes = cursor.fetchall()
    print(f"Produtos ativos com código vazio/nulo: {len(empty_codes)}")
    for p in empty_codes:
        print(f"  ID: {p[0]}, Nome: {p[1]}")

    # Associações sem produto válido
    cursor.execute("""
        SELECT a.id, a.panel_id, a.product_id 
        FROM product_panel_association a
        LEFT JOIN butcher_product p ON a.product_id = p.id
        WHERE p.id IS NULL
    """)
    orphans = cursor.fetchall()
    print(f"Associações órfãs (produto deletado): {len(orphans)}")
    for a in orphans:
        print(f"  Assoc ID: {a[0]}, Panel ID: {a[1]}, Product ID: {a[2]}")

    # Associações com produto inativo
    cursor.execute("""
        SELECT a.id, a.panel_id, a.product_id, p.nome
        FROM product_panel_association a
        JOIN butcher_product p ON a.product_id = p.id
        WHERE p.ativo = 0
    """)
    inactive_assocs = cursor.fetchall()
    print(f"Associações com produtos inativos: {len(inactive_assocs)}")
    for a in inactive_assocs:
        print(f"  Assoc ID: {a[0]}, Panel ID: {a[1]}, Product ID: {a[2]}, Nome: {a[3]}")

    conn.close()

if __name__ == "__main__":
    check_invalid_products()
