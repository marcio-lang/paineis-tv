
import sqlite3
import os

def check_visual_duplicates():
    db_path = os.path.join('BACKEND', 'instance', 'paineltv.db')
    if not os.path.exists(db_path):
        db_path = os.path.join('instance', 'paineltv.db')
    
    if not os.path.exists(db_path):
        print(f"Erro: Banco de dados não encontrado.")
        return

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT id, name FROM department_panel")
    panels = cursor.fetchall()

    for panel in panels:
        panel_id = panel['id']
        panel_name = panel['name']

        cursor.execute("""
            SELECT bp.nome, bp.codigo, COUNT(*) as count
            FROM product_panel_association ppa
            JOIN butcher_product bp ON ppa.product_id = bp.id
            WHERE ppa.panel_id = ? AND bp.ativo = 1
            GROUP BY bp.nome, bp.codigo
            HAVING COUNT(*) > 1
        """, (panel_id,))
        
        visual_dupes = cursor.fetchall()
        if visual_dupes:
            print(f"Painel: {panel_name} (ID: {panel_id})")
            for dupe in visual_dupes:
                print(f"  - AVISO: '{dupe['nome']}' (Cod: {dupe['codigo']}) aparece {dupe['count']} vezes!")
                
                # Listar as IDs reais desses produtos
                cursor.execute("""
                    SELECT bp.id as prod_id, ppa.id as assoc_id
                    FROM product_panel_association ppa
                    JOIN butcher_product bp ON ppa.product_id = bp.id
                    WHERE ppa.panel_id = ? AND bp.nome = ? AND bp.codigo = ? AND bp.ativo = 1
                """, (panel_id, dupe['nome'], dupe['codigo']))
                details = cursor.fetchall()
                for d in details:
                    print(f"    * Prod ID: {d['prod_id']} | Assoc ID: {d['assoc_id']}")

    conn.close()

if __name__ == "__main__":
    check_visual_duplicates()
