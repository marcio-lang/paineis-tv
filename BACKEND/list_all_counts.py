
import sqlite3
import os

def list_all_panels_and_counts():
    db_path = os.path.join('BACKEND', 'instance', 'paineltv.db')
    if not os.path.exists(db_path):
        db_path = os.path.join('instance', 'paineltv.db')
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("""
        SELECT dp.id, dp.name, d.name as dept_name,
        (SELECT COUNT(*) FROM product_panel_association ppa 
         JOIN butcher_product bp ON ppa.product_id = bp.id 
         WHERE ppa.panel_id = dp.id AND bp.ativo = 1) as count
        FROM department_panel dp
        JOIN department d ON dp.department_id = d.id
    """)
    panels = cursor.fetchall()

    print(f"{'Nome do Painel':<30} | {'Departamento':<15} | {'Count'}")
    print("-" * 60)
    for p in panels:
        print(f"{p['name']:<30} | {p['dept_name']:<15} | {p['count']}")

    conn.close()

if __name__ == "__main__":
    list_all_panels_and_counts()
