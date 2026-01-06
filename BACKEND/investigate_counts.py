
import sqlite3
import os

def investigate_counts():
    db_path = os.path.join('BACKEND', 'instance', 'paineltv.db')
    if not os.path.exists(db_path):
        db_path = os.path.join('instance', 'paineltv.db')
    
    if not os.path.exists(db_path):
        print(f"Erro: Banco de dados não encontrado.")
        return

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # 1. Check for products with empty names or codes
    print("--- Produtos com nome ou código suspeito ---")
    cursor.execute("""
        SELECT id, codigo, nome, ativo 
        FROM butcher_product 
        WHERE nome IS NULL OR nome = '' OR nome = 'None' OR codigo IS NULL OR codigo = ''
    """)
    suspicious = cursor.fetchall()
    if not suspicious:
        print("Nenhum produto com nome/código vazio encontrado.")
    for p in suspicious:
        print(f"ID: {p['id']} | Código: {p['codigo']} | Nome: '{p['nome']}' | Ativo: {p['ativo']}")

    # 2. Compare panel products_count with actual association count
    print("\n--- Comparação de Contagem por Painel ---")
    cursor.execute("SELECT id, name FROM department_panel")
    panels = cursor.fetchall()
    
    for panel in panels:
        panel_id = panel['id']
        panel_name = panel['name']
        
        # Simulating products_count logic: count associations where product is active
        cursor.execute("""
            SELECT COUNT(*) as count 
            FROM product_panel_association a
            JOIN butcher_product p ON a.product_id = p.id
            WHERE a.panel_id = ? AND p.ativo = 1
        """, (panel_id,))
        assoc_count = cursor.fetchone()['count']
        
        if assoc_count > 0:
            print(f"Painel: {panel_name} (ID: {panel_id})")
            print(f"  - Associações Ativas: {assoc_count}")
            
            # Check for any associations that might have null products or something weird
            cursor.execute("""
                SELECT a.id, a.product_id, p.nome, p.ativo
                FROM product_panel_association a
                LEFT JOIN butcher_product p ON a.product_id = p.id
                WHERE a.panel_id = ?
            """, (panel_id,))
            all_assocs = cursor.fetchall()
            for a in all_assocs:
                if a['product_id'] is None or a['nome'] is None:
                    print(f"  - AVISO: Associação {a['id']} tem produto inválido: ProductID={a['product_id']}, Nome={a['nome']}")

    conn.close()

if __name__ == "__main__":
    investigate_counts()
