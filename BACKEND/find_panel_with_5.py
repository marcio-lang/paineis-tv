
import os
import sys

# Adicionar o diretório atual ao sys.path para importar o app
sys.path.append(os.getcwd())

from app import app, db, DepartmentPanel, ProductPanelAssociation, ButcherProduct

def find_panel_with_5():
    with app.app_context():
        print("\n=== BUSCANDO PAINÉIS COM 5 PRODUTOS ===")
        panels = DepartmentPanel.query.all()
        for panel in panels:
            # Contagem de produtos ativos associados
            active_count = ProductPanelAssociation.query.filter_by(panel_id=panel.id).join(ButcherProduct).filter(ButcherProduct.ativo == True).count()
            
            # Contagem de produtos visíveis no painel
            visible_count = ProductPanelAssociation.query.filter_by(panel_id=panel.id, active_in_panel=True).join(ButcherProduct).filter(ButcherProduct.ativo == True).count()
            
            print(f"Panel: {panel.name} | Active: {active_count} | Visible: {visible_count}")
            
            if active_count == 5:
                print(f"  🎯 ENCONTRADO PAINEL COM 5 PRODUTOS ATIVOS: {panel.name}")
                assocs = ProductPanelAssociation.query.filter_by(panel_id=panel.id).all()
                for a in assocs:
                    print(f"    - Prod: {a.product.nome if a.product else 'N/A'} | Ativo: {a.product.ativo if a.product else 'N/A'} | VisibleInPanel: {a.active_in_panel}")

if __name__ == "__main__":
    find_panel_with_5()
