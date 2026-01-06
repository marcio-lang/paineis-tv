
import sys
import os

# Adicionar o diretório atual ao sys.path para importar o app
sys.path.append(os.getcwd())

from app import app, db, DepartmentPanel, ProductPanelAssociation, ButcherProduct

def find_mismatch():
    with app.app_context():
        print("\n=== BUSCANDO PAINÉIS COM DESALINHAMENTO DE CONTAGEM ===")
        panels = DepartmentPanel.query.all()
        found = False
        for panel in panels:
            data = panel.to_dict()
            count_to_dict = data['products_count']
            
            # Simular o que a rota /api/panels/<id>/products faz
            associations = ProductPanelAssociation.query.filter_by(
                panel_id=panel.id
            ).join(ButcherProduct).filter(ButcherProduct.ativo == True).all()
            
            list_count = len(associations)
            
            if count_to_dict != list_count:
                print(f"\nERRO DE CONTAGEM NO PAINEL: {panel.name} (ID: {panel.id})")
                print(f"  - products_count (to_dict): {count_to_dict}")
                print(f"  - len(associations) (rota): {list_count}")
                found = True
            
            # Verificar se há algum caso onde o usuário vê 5 mas a lista tem 4
            # Talvez no frontend?
            
            # Vamos listar todos que tem 5 ou 4
            if count_to_dict in [4, 5] or list_count in [4, 5]:
                print(f"\nPainel Candidato: {panel.name} (ID: {panel.id})")
                print(f"  - products_count: {count_to_dict}")
                print(f"  - list_count: {list_count}")
                for assoc in associations:
                    print(f"    - Produto: {assoc.product.nome} (ID: {assoc.product_id}, Ativo: {assoc.product.ativo}, Visível: {assoc.active_in_panel})")
        
        if not found:
            print("\nNenhum desalinhamento encontrado entre to_dict e a lógica da rota.")

if __name__ == "__main__":
    find_mismatch()
