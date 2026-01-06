
import sqlite3
import os

def check_orphans():
    db_path = os.path.join('BACKEND', 'instance', 'paineltv.db')
    if not os.path.exists(db_path):
        db_path = os.path.join('instance', 'paineltv.db')
    
    if not os.path.exists(db_path):
        print(f"Erro: Banco de dados não encontrado.")
        return

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    print("--- Verificando Associações Órfãs (sem produto correspondente) ---")
    cursor.execute("""
        SELECT ppa.id, ppa.panel_id, ppa.product_id 
        FROM product_panel_association ppa
        LEFT JOIN butcher_product bp ON ppa.product_id = bp.id
        WHERE bp.id IS NULL
    """)
    orphans = cursor.fetchall()
    if orphans:
        print(f"Encontradas {len(orphans)} associações órfãs:")
        for o in orphans:
            print(f"  Assoc ID: {o['id']}, Panel ID: {o['panel_id']}, Missing Product ID: {o['product_id']}")
    else:
        print("Nenhuma associação órfã encontrada.")

    conn.close()

if __name__ == "__main__":
    check_orphans()
