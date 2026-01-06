
import os
import sys

# Adiciona o diretório atual ao path para importar o app
sys.path.append(os.getcwd())

from app import app, db, ProductPanelAssociation, DepartmentPanel, ButcherProduct

def check_active_flags():
    with app.app_context():
        print("--- Verificação de active_in_panel ---")
        
        # Contagem total de associações
        total_assocs = ProductPanelAssociation.query.count()
        print(f"Total de associações: {total_assocs}")
        
        # Associações com active_in_panel=False
        inactive_assocs = ProductPanelAssociation.query.filter_by(active_in_panel=False).all()
        print(f"Associações inativas (active_in_panel=False): {len(inactive_assocs)}")
        
        for assoc in inactive_assocs:
            product = ButcherProduct.query.get(assoc.product_id)
            panel = DepartmentPanel.query.get(assoc.panel_id)
            prod_name = product.name if product else "Desconhecido"
            panel_name = panel.name if panel else "Desconhecido"
            print(f"  - Produto: {prod_name} (ID: {assoc.product_id}) | Painel: {panel_name} (ID: {assoc.panel_id})")

        print("\n--- Verificação de products_count no to_dict ---")
        panels = DepartmentPanel.query.all()
        for p in panels:
            # Lógica atual no to_dict (pelo que vi no app.py)
            # products_count: len([assoc for assoc in self.product_associations if assoc.product and assoc.product.ativo])
            
            assocs = p.product_associations
            count_active_prod = len([a for a in assocs if a.product and a.product.ativo])
            count_active_in_panel = len([a for a in assocs if a.product and a.product.ativo and a.active_in_panel])
            
            if count_active_prod != count_active_in_panel:
                print(f"Divergência no Painel {p.name}:")
                print(f"  - Ativos no Cadastro: {count_active_prod}")
                print(f"  - Ativos no Painel (active_in_panel=True): {count_active_in_panel}")
                print(f"  - Diferença: {count_active_prod - count_active_in_panel}")

if __name__ == "__main__":
    check_active_flags()
