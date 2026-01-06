
import sqlite3
import os

def list_all_panels():
    db_path = os.path.join('BACKEND', 'instance', 'paineltv.db')
    if not os.path.exists(db_path):
        db_path = os.path.join('instance', 'paineltv.db')
    
    if not os.path.exists(db_path):
        print(f"Erro: Banco de dados não encontrado.")
        return

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT id, name, department_id FROM department_panel")
    panels = cursor.fetchall()

    for panel in panels:
        p_id = panel['id']
        p_name = panel['name']
        
        cursor.execute("SELECT name FROM department WHERE id = ?", (panel['department_id'],))
        dept = cursor.fetchone()
        dept_name = dept['name'] if dept else "N/A"

        cursor.execute("""
            SELECT COUNT(*) FROM product_panel_association ppa
            JOIN butcher_product bp ON ppa.product_id = bp.id
            WHERE ppa.panel_id = ? AND bp.ativo = 1
        """, (p_id,))
        count = cursor.fetchone()[0]

        print(f"Painel: {p_name} | Dept: {dept_name} | Produtos: {count} | ID: {p_id}")

    conn.close()

if __name__ == "__main__":
    list_all_panels()
