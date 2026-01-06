
import os
import sys

# Adicionar o diretório BACKEND ao path para importar os modelos
sys.path.append(os.path.join(os.getcwd(), 'BACKEND'))

from app import app, db, DepartmentPanel, ProductPanelAssociation, ButcherProduct

def check_discrepancy_direct():
    with app.app_context():
        panels = DepartmentPanel.query.all()
        
        found_any = False
        for panel in panels:
            # 1. Count from to_dict()
            dict_count = panel.to_dict()['products_count']
            
            # 2. Simulate get_panel_products route
            associations = ProductPanelAssociation.query.filter_by(
                panel_id=panel.id
            ).join(ButcherProduct).filter(ButcherProduct.ativo == True).all()
            route_count = len(associations)
            
            if dict_count != route_count:
                found_any = True
                print(f"DISCREPÂNCIA no painel '{panel.name}' (ID: {panel.id}):")
                print(f"  - No to_dict(): {dict_count}")
                print(f"  - Na rota /products: {route_count}")
                
                # Check for associations without products
                all_assocs = ProductPanelAssociation.query.filter_by(panel_id=panel.id).all()
                for assoc in all_assocs:
                    if assoc.product is None:
                        print(f"  - AVISO: Associação {assoc.id} não tem produto (ORFANATO)")
                    elif not assoc.product.ativo:
                        print(f"  - INFO: Associação {assoc.id} tem produto inativo (ID: {assoc.product_id})")
        
        if not found_any:
            print("Nenhuma discrepância encontrada entre to_dict() e a rota de listagem.")

if __name__ == "__main__":
    check_discrepancy_direct()
