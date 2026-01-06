
import sys
import os

sys.path.append(os.getcwd())

from app import app, db, DepartmentPanel, ProductPanelAssociation, ButcherProduct

def find_5_product_panels():
    with app.app_context():
        print("\n=== PAINÉIS COM 5 OU 4 PRODUTOS ===")
        panels = DepartmentPanel.query.all()
        for panel in panels:
            data = panel.to_dict()
            count = data['products_count']
            
            if count in [4, 5]:
                print(f"\nPAINEL: {panel.name} (ID: {panel.id})")
                print(f"  - products_count (to_dict): {count}")
                
                assocs = ProductPanelAssociation.query.filter_by(panel_id=panel.id).all()
                active_assocs = [a for a in assocs if a.product and a.product.ativo]
                print(f"  - Associações ativas no DB: {len(active_assocs)}")
                
                for assoc in active_assocs:
                    p = assoc.product
                    print(f"    - {p.nome} (ID: {p.id}, Visível: {assoc.active_in_panel})")

if __name__ == "__main__":
    find_5_product_panels()
