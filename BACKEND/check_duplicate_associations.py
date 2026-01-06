import sqlite3
import os

def check_duplicate_associations():
    db_path = os.path.join(os.getcwd(), 'BACKEND', 'instance', 'paineltv.db')
    if not os.path.exists(db_path):
        print(f"Erro: Banco de dados não encontrado em {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("--- Verificando associações duplicadas (mesmo produto no mesmo painel) ---")
    
    cursor.execute("""
        SELECT product_id, panel_id, COUNT(*) 
        FROM product_panel_association 
        GROUP BY product_id, panel_id 
        HAVING COUNT(*) > 1
    """)
    rows = cursor.fetchall()
    
    if rows:
        print(f"Encontradas {len(rows)} duplicatas:")
        for row in rows:
            p_id, panel_id, count = row
            
            # Pegar nomes para facilitar a leitura
            cursor.execute("SELECT nome FROM butcher_product WHERE id = ?", (p_id,))
            p_name = cursor.fetchone()[0]
            
            cursor.execute("SELECT name FROM department_panel WHERE id = ?", (panel_id,))
            panel_name = cursor.fetchone()[0]
            
            print(f"Produto: {p_name} (ID: {p_id}) | Painel: {panel_name} (ID: {panel_id}) | Qtd: {count}")
    else:
        print("Nenhuma associação duplicada encontrada.")

    conn.close()

if __name__ == "__main__":
    check_duplicate_associations()
