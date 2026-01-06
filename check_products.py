
import sqlite3
import os

def check_db():
    db_path = os.path.join('BACKEND', 'instance', 'paineltv.db')
    if not os.path.exists(db_path):
        print(f"Erro: Banco de dados não encontrado em {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("--- Painéis ---")
    cursor.execute("SELECT id, name FROM department_panel")
    panels = cursor.fetchall()
    
    for p_id, p_name in panels:
        print(f"\nPainel: {p_name} ({p_id})")
        cursor.execute("""
            SELECT 
                p.id, p.codigo, p.nome, p.ativo, 
                a.position_override, a.active_in_panel
            FROM product_panel_association a
            JOIN butcher_product p ON a.product_id = p.id
            WHERE a.panel_id = ?
            ORDER BY a.position_override
        """, (p_id,))
        products = cursor.fetchall()
        print(f"Total produtos associados: {len(products)}")
        for prod in products:
            pid, codigo, nome, ativo_global, pos, ativo_painel = prod
            print(f"  Pos: {pos} | Nome: '{nome}' | Cod: {codigo} | AtivoGlobal: {ativo_global} | AtivoPainel: {ativo_painel}")

    conn.close()

if __name__ == "__main__":
    check_db()
