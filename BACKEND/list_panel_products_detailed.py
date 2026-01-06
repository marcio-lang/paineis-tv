
import sqlite3
import os

def list_panel_products_detailed():
    db_path = os.path.join('BACKEND', 'instance', 'paineltv.db')
    if not os.path.exists(db_path):
        print(f"Erro: Banco de dados não encontrado em {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 1. Obter todos os painéis
    cursor.execute("SELECT id, name FROM department_panel")
    panels = cursor.fetchall()

    for panel_id, panel_name in panels:
        # if "Açougue" not in panel_name:
        #     continue
        print(f"\n--- Painel: {panel_name} (ID: {panel_id}) ---")
        
        # Contagem oficial via query
        cursor.execute("""
            SELECT COUNT(*) 
            FROM product_panel_association a
            JOIN butcher_product p ON a.product_id = p.id
            WHERE a.panel_id = ? AND p.ativo = 1
        """, (panel_id,))
        count = cursor.fetchone()[0]
        print(f"Contagem de produtos ativos: {count}")

        # Listar os produtos
        cursor.execute("""
            SELECT p.id, p.codigo, p.nome, a.active_in_panel, a.id
            FROM product_panel_association a
            JOIN butcher_product p ON a.product_id = p.id
            WHERE a.panel_id = ? AND p.ativo = 1
            ORDER BY a.position_override, p.posicao
        """, (panel_id,))
        products = cursor.fetchall()
        
        for p_id, p_code, p_name, active_in_panel, assoc_id in products:
            status = "VISÍVEL" if active_in_panel else "OCULTO"
            print(f"  [{status}] Code: {p_code} | Name: {p_name} | ProductID: {p_id} | AssocID: {assoc_id}")

    conn.close()

if __name__ == "__main__":
    list_panel_products_detailed()
