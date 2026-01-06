
import os
import sys

# Adicionar o diretório atual ao sys.path para importar o app
sys.path.append(os.getcwd())

from app import app, db, Department, DepartmentPanel, ProductPanelAssociation, ButcherProduct

def find_mismatch_panels():
    with app.app_context():
        print("\n=== BUSCANDO PAINÉIS COM POSSÍVEL DESALINHAMENTO (5 vs 4) ===")
        
        panels = DepartmentPanel.query.all()
        found = False
        for panel in panels:
            all_assocs = ProductPanelAssociation.query.filter_by(panel_id=panel.id).all()
            active_prod_assocs = [a for a in all_assocs if a.product and a.product.ativo]
            visible_assocs = [a for a in active_prod_assocs if a.active_in_panel]
            
            count_to_dict = panel.to_dict()['products_count']
            
            # Se a contagem for 5 ou 4, ou houver diferença entre ativa e visível
            if count_to_dict in [4, 5] or len(active_prod_assocs) != len(visible_assocs):
                found = True
                print(f"\nPainel: {panel.name} (ID: {panel.id})")
                print(f"Departamento: {panel.department.name if panel.department else 'N/A'}")
                print(f"  - products_count (to_dict): {count_to_dict}")
                print(f"  - Total associações: {len(all_assocs)}")
                print(f"  - Associações com produtos ativos: {len(active_prod_assocs)}")
                print(f"  - Associações visíveis (active_in_panel=True): {len(visible_assocs)}")
                
                print("  Produtos:")
                for assoc in all_assocs:
                    status = "ATIVO" if assoc.product and assoc.product.ativo else "INATIVO"
                    visible = "SIM" if assoc.active_in_panel else "NÃO"
                    prod_name = assoc.product.nome if assoc.product else "N/A"
                    print(f"    - [{status}] [Visível: {visible}] {prod_name}")

        if not found:
            print("Nenhum painel com contagem 4 ou 5 encontrado.")

if __name__ == "__main__":
    find_mismatch_panels()
