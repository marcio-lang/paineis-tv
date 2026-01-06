
import sqlite3
import os

def check_active_in_panel():
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
        JOIN department_panel dp ON ppa.panel_id = dp.id
        WHERE ppa.active_in_panel = 0
        GROUP BY ppa.panel_id
    """)
    results = cursor.fetchall()

    if not results:
        print("Nenhum produto com active_in_panel = 0 encontrado.")
    else:
        for r in results:
            print(f"Painel: {r['panel_name']} | Ocultos: {r['count']}")

    conn.close()

if __name__ == "__main__":
    check_active_in_panel()
