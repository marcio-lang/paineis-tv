
import sqlite3
import os

def check_raw_associations():
    db_path = os.path.join('BACKEND', 'instance', 'paineltv.db')
    if not os.path.exists(db_path):
        db_path = os.path.join('instance', 'paineltv.db')
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    print("--- Todas as associações no banco ---")
    cursor.execute("""
        SELECT a.id, a.panel_id, a.product_id, p.nome as product_name, p.ativo as product_active, a.active_in_panel
        FROM product_panel_association a
        LEFT JOIN butcher_product p ON a.product_id = p.id
    """)
    rows = cursor.fetchall()
    
    panel_counts = {}
    for r in rows:
        p_id = r['panel_id']
        if p_id not in panel_counts:
            panel_counts[p_id] = {'total': 0, 'active_prod': 0, 'items': []}
        
        panel_counts[p_id]['total'] += 1
        if r['product_active'] == 1:
            panel_counts[p_id]['active_prod'] += 1
        
        panel_counts[p_id]['items'].append(dict(r))

    for p_id, data in panel_counts.items():
        cursor.execute("SELECT name FROM department_panel WHERE id = ?", (p_id,))
        p_name = cursor.fetchone()
        p_name = p_name['name'] if p_name else "Unknown"
        
        print(f"\nPainel: {p_name} (ID: {p_id})")
        print(f"  Total associações: {data['total']}")
        print(f"  Associações com produto ativo: {data['active_prod']}")
        
        # Check for duplicates (same product in same panel)
        product_ids = [item['product_id'] for item in data['items']]
        duplicates = [pid for pid in set(product_ids) if product_ids.count(pid) > 1]
        if duplicates:
            print(f"  !!! AVISO: Produtos duplicados neste painel: {duplicates}")
            for pid in duplicates:
                names = [item['product_name'] for item in data['items'] if item['product_id'] == pid]
                print(f"    - Produto ID {pid} ('{names[0]}') aparece {product_ids.count(pid)} vezes")

    conn.close()

if __name__ == "__main__":
    check_raw_associations()
