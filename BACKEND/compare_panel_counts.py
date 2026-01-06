
import sqlite3
import os

def compare_counts():
    db_path = os.path.join('BACKEND', 'instance', 'paineltv.db')
    if not os.path.exists(db_path):
        db_path = os.path.join('instance', 'paineltv.db')
    
    if not os.path.exists(db_path):
        print(f"Erro: Banco de dados não encontrado.")
        return

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    print(f"{'Painel ID':<38} | {'Nome':<20} | {'Count Dict':<10} | {'Count List':<10} | {'Status'}")
    print("-" * 100)

    cursor.execute("SELECT id, name FROM department_panel")
    panels = cursor.fetchall()

    discrepancies_found = False
    for panel in panels:
        panel_id = panel['id']
        panel_name = panel['name']

        # Método 1: Como o to_dict faz
        cursor.execute("""
            SELECT COUNT(*) FROM product_panel_association ppa
            JOIN butcher_product bp ON ppa.product_id = bp.id
            WHERE ppa.panel_id = ? AND ppa.active_in_panel = 1 AND bp.ativo = 1
        """, (panel_id,))
        count_dict = cursor.fetchone()[0]

        # Método 2: Como o get_panel_products faz
        cursor.execute("""
            SELECT COUNT(*) FROM product_panel_association ppa
            JOIN butcher_product bp ON ppa.product_id = bp.id
            WHERE ppa.panel_id = ? AND bp.ativo = 1
        """, (panel_id,))
        count_list = cursor.fetchone()[0]

        if count_dict != count_list:
            discrepancies_found = True
            print(f"DISCREPÂNCIA encontrada no painel: {panel_name} (ID: {panel_id})")
            print(f"  - Count Dict (active_in_panel=1): {count_dict}")
            print(f"  - Count List (all active products): {count_list}")
            
            # Mostrar quais produtos estão causando a discrepância
            cursor.execute("""
                SELECT bp.nome, bp.codigo, ppa.active_in_panel
                FROM product_panel_association ppa
                JOIN butcher_product bp ON ppa.product_id = bp.id
                WHERE ppa.panel_id = ? AND bp.ativo = 1 AND ppa.active_in_panel = 0
            """, (panel_id,))
            hidden_products = cursor.fetchall()
            print("  - Produtos inativos no painel (contam no List mas não no Dict):")
            for p in hidden_products:
                print(f"    * {p['nome']} (Cod: {p['codigo']})")
            print("-" * 50)

    if not discrepancies_found:
        print("Nenhuma discrepância de 'active_in_panel' encontrada entre os métodos de contagem e listagem.")

    conn.close()

if __name__ == "__main__":
    compare_counts()
