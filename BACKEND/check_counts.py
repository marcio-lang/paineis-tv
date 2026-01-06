
import sqlite3
import os

def check_counts_discrepancy():
    db_path = os.path.join('BACKEND', 'instance', 'paineltv.db')
    if not os.path.exists(db_path):
        db_path = os.path.join('instance', 'paineltv.db')
    
    if not os.path.exists(db_path):
        print(f"Erro: Banco de dados não encontrado.")
        return

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Get all panels
    cursor.execute("SELECT id, name FROM department_panel")
    panels = cursor.fetchall()

    for panel in panels:
        panel_id = panel['id']
        panel_name = panel['name']

        # Count active products in this panel
        cursor.execute("""
            SELECT COUNT(*) as count
            FROM product_panel_association ppa
            JOIN butcher_product bp ON ppa.product_id = bp.id
            WHERE ppa.panel_id = ? AND bp.ativo = 1
        """, (panel_id,))
        db_count = cursor.fetchone()['count']

        print(f"Painel: {panel_name} (ID: {panel_id}) | DB Count: {db_count}")

    conn.close()

if __name__ == "__main__":
    check_counts_discrepancy()
