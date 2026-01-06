
import sys
import os

sys.path.append(os.getcwd())

from app import app, db, DepartmentPanel, ProductPanelAssociation, ButcherProduct

def list_all_panel_details():
    with app.app_context():
        print("\n=== DETALHES DE TODOS OS PAINÉIS E PRODUTOS ===")
        panels = DepartmentPanel.query.all()
        for panel in panels:
            print(f"\nPAINEL: {panel.name} (ID: {panel.id})")
            print(f"  - products_count (to_dict): {panel.to_dict()['products_count']}")
            
            assocs = ProductPanelAssociation.query.filter_by(panel_id=panel.id).all()
            print(f"  - Total de associações no DB: {len(assocs)}")
            
            for assoc in assocs:
                p = assoc.product
                if not p:
                    print(f"    - [ERRO] Associação sem produto! ID: {assoc.id}")
                    continue
                print(f"    - Produto: {p.nome} (ID: {p.id}, Ativo: {p.ativo}, Visível: {assoc.active_in_panel})")

if __name__ == "__main__":
    list_all_panel_details()
