
import sqlite3
import os

def check_counts_raw():
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

        # Contagem total de associações
        cursor.execute("SELECT COUNT(*) FROM product_panel_association WHERE panel_id = ?", (panel_id,))
        total_assoc = cursor.fetchone()[0]

        # Contagem de associações com produto existente
        cursor.execute("""
            SELECT COUNT(*) FROM product_panel_association ppa
            JOIN butcher_product bp ON ppa.product_id = bp.id
            WHERE ppa.panel_id = ?
        """, (panel_id,))
        assoc_with_prod = cursor.fetchone()[0]

        # Contagem de associações com produto ativo
        cursor.execute("""
            SELECT COUNT(*) FROM product_panel_association ppa
            JOIN butcher_product bp ON ppa.product_id = bp.id
            WHERE ppa.panel_id = ? AND bp.ativo = 1
        """, (panel_id,))
        assoc_active_prod = cursor.fetchone()[0]

        if total_assoc > 0:
            print(f"Painel: {panel_name}")
            print(f"  Total Associações: {total_assoc}")
            print(f"  Associações com Produto Existente: {assoc_with_prod}")
            print(f"  Associações com Produto Ativo: {assoc_active_prod}")
            
            if total_assoc != assoc_active_prod:
                print(f"  !!! DISCREPÂNCIA ENCONTRADA NO PAINEL {panel_name} !!!")
                
                # Detalhes das associações problemáticas
                cursor.execute("""
                    SELECT ppa.id, ppa.product_id, bp.nome, bp.ativo
                    FROM product_panel_association ppa
                    LEFT JOIN butcher_product bp ON ppa.product_id = bp.id
                    WHERE ppa.panel_id = ?
                """, (panel_id,))
                details = cursor.fetchall()
                for d in details:
                    status = "OK"
                    if d['product_id'] is None: status = "SEM PRODUCT_ID"
                    elif d['nome'] is None: status = "PRODUTO NÃO ENCONTRADO (ÓRFÃO)"
                    elif d['ativo'] == 0: status = "PRODUTO INATIVO"
                    
                    if status != "OK":
                        print(f"    - Assoc {d['id'][:8]}: Prod {str(d['product_id'])[:8]} | Nome: {d['nome']} | Status: {status}")

    conn.close()

if __name__ == "__main__":
    check_counts_raw()
