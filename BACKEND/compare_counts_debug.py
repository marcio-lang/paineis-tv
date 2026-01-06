import os
import sys

# Adicionar o diretório atual ao path para importar o app
sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), 'BACKEND'))

from BACKEND.app import app, db, DepartmentPanel, ProductPanelAssociation, ButcherProduct

def compare_counts():
    with app.app_context():
        print(f"{'Nome do Painel':<30} | {'to_dict':<10} | {'API Route':<10} | {'Diff':<5}")
        print("-" * 65)
        
        panels = DepartmentPanel.query.all()
        for panel in panels:
            # 1. Contagem via to_dict
            count_to_dict = panel.to_dict()['products_count']
            
            # 2. Simulação da rota get_panel_products
            associations = ProductPanelAssociation.query.filter_by(
                panel_id=panel.id
            ).join(ButcherProduct).filter(ButcherProduct.ativo == True).all()
            count_api = len(associations)
            
            diff = count_to_dict - count_api
            
            print(f"{panel.name[:30]:<30} | {count_to_dict:<10} | {count_api:<10} | {diff:<5}")
            
            if diff != 0:
                print(f"  !!! DISCREPÂNCIA NO PAINEL: {panel.name}")
                # Investigar a discrepância
                assoc_ids_to_dict = [assoc.id for assoc in panel.product_associations if assoc.product and assoc.product.ativo]
                assoc_ids_api = [assoc.id for assoc in associations]
                
                only_in_to_dict = set(assoc_ids_to_dict) - set(assoc_ids_api)
                only_in_api = set(assoc_ids_api) - set(assoc_ids_to_dict)
                
                if only_in_to_dict:
                    print(f"  IDs apenas no to_dict: {only_in_to_dict}")
                    for aid in only_in_to_dict:
                        a = ProductPanelAssociation.query.get(aid)
                        print(f"    - Assoc {aid}: ProductID={a.product_id}, ProductName={a.product.nome if a.product else 'N/A'}")
                if only_in_api:
                    print(f"  IDs apenas na API: {only_in_api}")

if __name__ == "__main__":
    compare_counts()
