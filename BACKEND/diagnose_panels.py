
import os
import sys

# Adicionar o diretório BACKEND ao path para importar os modelos
sys.path.append(os.path.join(os.getcwd(), 'BACKEND'))

from app import app, db, DepartmentPanel, ProductPanelAssociation, ButcherProduct

def check_panel_data():
    with app.app_context():
        panels = DepartmentPanel.query.all()
        print(f"Total de painéis: {len(panels)}")
        
        for panel in panels:
            # Pegar todas as associações deste painel
            all_assocs = ProductPanelAssociation.query.filter_by(panel_id=panel.id).all()
            
            # Pegar associações com produtos ativos
            active_product_assocs = ProductPanelAssociation.query.filter_by(panel_id=panel.id).join(
                ButcherProduct
            ).filter(ButcherProduct.ativo == True).all()
            
            if len(all_assocs) != len(active_product_assocs) or len(all_assocs) > 0:
                print(f"\nPainel ID: {panel.id} - Nome: {panel.name}")
                print(f"  Total de associações: {len(all_assocs)}")
                print(f"  Associações com produtos ativos (ButcherProduct.ativo == True): {len(active_product_assocs)}")
                
                # Verificar active_in_panel
                active_in_panel_assocs = [a for a in all_assocs if a.active_in_panel]
                print(f"  Associações marcadas como ativas no painel (active_in_panel == True): {len(active_in_panel_assocs)}")

                # Verificar a contagem que o to_dict faz
                print(f"  Contagem do to_dict (produtos ativos AND active_in_panel): {panel.to_dict()['products_count']}")

                # Verificar associações órfãs (sem produto)
                orphaned = [a for a in all_assocs if a.product is None]
                if orphaned:
                    print(f"  AVISO: {len(orphaned)} associações órfãs encontradas (produto deletado)")

                # Verificar a contagem exata que o get_panel_products faz
                # associations = ProductPanelAssociation.query.filter_by(panel_id=panel.id).join(ButcherProduct).filter(ButcherProduct.ativo == True).all()
                # Precisamos simular o INNER JOIN
                count_get_route = 0
                for a in all_assocs:
                    if a.product and a.product.ativo:
                        count_get_route += 1
                print(f"  Contagem que o get_panel_products deve retornar: {count_get_route}")

                # Verificar duplicatas por NOME e CÓDIGO (o que causa agrupamento na TV)
                name_code_counts = {}
                for assoc in all_assocs:
                    if assoc.product:
                        key = (assoc.product.nome.strip().lower(), assoc.product.codigo.strip())
                        name_code_counts[key] = name_code_counts.get(key, 0) + 1
                
                visual_duplicates = {k: count for k, count in name_code_counts.items() if count > 1}
                if visual_duplicates:
                    print(f"  !!! AVISO: Duplicatas VISUAIS encontradas (mesmo nome e código):")
                    for (name, code), count in visual_duplicates.items():
                        print(f"    - '{name}' (Código: {code}) aparece {count} vezes no banco, mas aparecerá apenas 1 vez na TV")
                else:
                    print("  Nenhuma duplicata visual encontrada.")

if __name__ == "__main__":
    check_panel_data()
