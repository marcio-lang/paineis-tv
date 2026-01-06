
import sqlite3
import os
import sys

# Adicionar o diretório BACKEND ao path para importar os modelos se necessário
# Mas vamos fazer via SQL direto para ser mais preciso sobre o que está no banco
def check_count_discrepancy():
    db_path = os.path.join('BACKEND', 'instance', 'paineltv.db')
    if not os.path.exists(db_path):
        print(f"Erro: Banco de dados não encontrado em {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("--- Verificando discrepâncias de contagem em todos os painéis ---")
    
    # 1. Obter todos os painéis
    cursor.execute("SELECT id, name FROM department_panel")
    panels = cursor.fetchall()
    print(f"Total de painéis encontrados: {len(panels)}")

    for panel_id, panel_name in panels:
        # Contagem via logic de to_dict()
        # 'products_count': len([assoc for assoc in self.product_associations if assoc.product and assoc.product.ativo])
        cursor.execute("""
            SELECT COUNT(*) 
            FROM product_panel_association a
            JOIN butcher_product p ON a.product_id = p.id
            WHERE a.panel_id = ? AND p.ativo = 1
        """, (panel_id,))
        count_to_dict = cursor.fetchone()[0]

        # Contagem via logic de get_panel_products()
        # associations = ProductPanelAssociation.query.filter_by(panel_id=panel_id).join(ButcherProduct).filter(ButcherProduct.ativo == True).all()
        # É a mesma query SQL acima.
        
        # Vamos verificar se há associações que NÃO têm produto correspondente
        cursor.execute("""
            SELECT COUNT(*) 
            FROM product_panel_association 
            WHERE panel_id = ?
        """, (panel_id,))
        total_assocs = cursor.fetchone()[0]

        if count_to_dict != total_assocs:
            print(f"Painel: {panel_name} (ID: {panel_id})")
            print(f"  Total Associações: {total_assocs}")
            print(f"  Produtos Ativos (count_to_dict): {count_to_dict}")
            
            # Verificar se há produtos inativos associados
            cursor.execute("""
                SELECT p.nome, p.ativo
                FROM product_panel_association a
                JOIN butcher_product p ON a.product_id = p.id
                WHERE a.panel_id = ? AND p.ativo = 0
            """, (panel_id,))
            inactive = cursor.fetchall()
            if inactive:
                print(f"  Produtos INATIVOS associados: {len(inactive)}")
                for name, ativo in inactive:
                    print(f"    - {name} (ativo={ativo})")
            
            # Verificar se há associações órfãs
            cursor.execute("""
                SELECT a.product_id
                FROM product_panel_association a
                LEFT JOIN butcher_product p ON a.product_id = p.id
                WHERE a.panel_id = ? AND p.id IS NULL
            """, (panel_id,))
            orphans = cursor.fetchall()
            if orphans:
                print(f"  Associações ÓRFÃS: {len(orphans)}")
        else:
            if total_assocs > 0:
                print(f"Painel: {panel_name} OK (Count: {total_assocs})")

    conn.close()

if __name__ == "__main__":
    check_count_discrepancy()
