
import sqlite3
import os

def check_associations_inactive_products():
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
        SELECT ppa.panel_id, dp.name as panel_name, COUNT(*) as count
        FROM product_panel_association ppa
        JOIN butcher_product bp ON ppa.product_id = bp.id
        JOIN department_panel dp ON ppa.panel_id = dp.id
        WHERE bp.ativo = 0
        GROUP BY ppa.panel_id
    """)
    results = cursor.fetchall()

    if not results:
        print("Nenhuma associação com produto inativo encontrada.")
    else:
        for r in results:
            print(f"Painel: {r['panel_name']} | Produtos Inativos Associados: {r['count']}")

    conn.close()

if __name__ == "__main__":
    check_associations_inactive_products()
