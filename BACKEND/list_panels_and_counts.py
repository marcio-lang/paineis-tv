import sqlite3
import os

def list_panels_and_counts():
    db_path = os.path.join(os.getcwd(), 'BACKEND', 'instance', 'paineltv.db')
    if not os.path.exists(db_path):
        print(f"Erro: Banco de dados não encontrado em {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print(f"{'Nome do Painel':<30} | {'DB Count':<10} | {'Associations':<15}")
    print("-" * 60)
    
    cursor.execute("SELECT id, name FROM department_panel")
    panels = cursor.fetchall()
    
    for p_id, p_name in panels:
        # Contagem via SQL (simulando o to_dict)
        cursor.execute("""
            SELECT COUNT(*) 
            FROM product_panel_association a
            JOIN butcher_product p ON a.product_id = p.id
            WHERE a.panel_id = ? AND p.ativo = 1
        """, (p_id,))
        count = cursor.fetchone()[0]
        
        # Listar IDs das associações
        cursor.execute("""
            SELECT a.id, p.nome, p.ativo
            FROM product_panel_association a
            JOIN butcher_product p ON a.product_id = p.id
            WHERE a.panel_id = ?
        """, (p_id,))
        assocs = cursor.fetchall()
        
        print(f"{p_name[:30]:<30} | {count:<10} | {len(assocs):<15}")
        for a_id, p_nome, p_ativo in assocs:
            status = "ATIVO" if p_ativo else "INATIVO"
            print(f"  -> Assoc: {a_id} | Prod: {p_nome} ({status})")

    conn.close()

if __name__ == "__main__":
    list_panels_and_counts()
