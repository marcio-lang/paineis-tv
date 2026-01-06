import sqlite3
import os

def check_orphaned_associations():
    db_path = os.path.join(os.getcwd(), 'BACKEND', 'instance', 'paineltv.db')
    if not os.path.exists(db_path):
        print(f"Erro: Banco de dados não encontrado em {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("--- Verificando associações órfãs (produto não existe) ---")
    
    cursor.execute("""
        SELECT a.id, a.product_id, a.panel_id 
        FROM product_panel_association a
        LEFT JOIN butcher_product p ON a.product_id = p.id
        WHERE p.id IS NULL
    """)
    rows = cursor.fetchall()
    
    if rows:
        print(f"Encontradas {len(rows)} associações órfãs:")
        for row in rows:
            print(f"ID: {row[0]} | ProdID: {row[1]} | PanelID: {row[2]}")
    else:
        print("Nenhuma associação órfã encontrada.")

    conn.close()

if __name__ == "__main__":
    check_orphaned_associations()
