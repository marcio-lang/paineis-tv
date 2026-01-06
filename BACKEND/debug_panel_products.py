
import sqlite3
import os
import json

def debug_panel_products():
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

        cursor.execute("""
            SELECT ppa.id as assoc_id, bp.id as product_id, bp.nome, bp.ativo
            FROM product_panel_association ppa
            JOIN butcher_product bp ON ppa.product_id = bp.id
            WHERE ppa.panel_id = ? AND bp.ativo = 1
        """, (panel_id,))
        products = cursor.fetchall()

        print(f"\nPainel: {panel_name} ({len(products)} produtos)")
        ids = [p['assoc_id'] for p in products]
        if len(ids) != len(set(ids)):
            print("!!! AVISO: IDs de associação duplicados encontrados !!!")
            seen = set()
            for i in ids:
                if i in seen:
                    print(f"Duplicado: {i}")
                seen.add(i)
        
        for p in products:
            print(f"  - Assoc ID: {p['assoc_id']} | Product: {p['nome']} (ID: {p['product_id']})")

    conn.close()

if __name__ == "__main__":
    debug_panel_products()
