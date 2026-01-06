
import sqlite3
import os

def check_unassociated_products():
    db_path = os.path.join('BACKEND', 'instance', 'paineltv.db')
    if not os.path.exists(db_path):
        db_path = os.path.join('instance', 'paineltv.db')
    
    if not os.path.exists(db_path):
        print(f"Erro: Banco de dados não encontrado.")
        return

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("""
        SELECT COUNT(*) as count
        FROM butcher_product bp
        LEFT JOIN product_panel_association ppa ON bp.id = ppa.product_id
        WHERE bp.ativo = 1 AND ppa.id IS NULL
    """)
    result = cursor.fetchone()
    print(f"Produtos ativos sem painel: {result['count']}")

    conn.close()

if __name__ == "__main__":
    check_unassociated_products()
