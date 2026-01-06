
import os
import sys

# Adicionar o diretório atual ao sys.path para importar o app
sys.path.append(os.getcwd())

from app import app, db, Department, DepartmentPanel, ProductPanelAssociation, ButcherProduct

def list_all_counts_simple():
    with app.app_context():
        print("\n=== LISTA DE TODOS OS PAINÉIS E CONTAGENS ===")
        
        panels = DepartmentPanel.query.all()
        for panel in panels:
            count_to_dict = panel.to_dict()['products_count']
            all_assocs = ProductPanelAssociation.query.filter_by(panel_id=panel.id).all()
            active_prod_assocs = [a for a in all_assocs if a.product and a.product.ativo]
            visible_assocs = [a for a in active_prod_assocs if a.active_in_panel]
            
            print(f"Panel: {panel.name} | Dept: {panel.department.name if panel.department else 'N/A'} | DictCount: {count_to_dict} | Active: {len(active_prod_assocs)} | Visible: {len(visible_assocs)}")

if __name__ == "__main__":
    list_all_counts_simple()
