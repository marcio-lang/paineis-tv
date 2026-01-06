
import os
import sys

# Adicionar o diretório BACKEND ao path para importar os modelos
sys.path.append(os.path.join(os.getcwd(), 'BACKEND'))

from app import app, db, DepartmentPanel, ProductPanelAssociation, ButcherProduct

def check_active_in_panel():
    with app.app_context():
        panels = DepartmentPanel.query.all()
        for panel in panels:
            all_active_prods = [a for a in panel.product_associations if a.product and a.product.ativo]
            visible_prods = [a for a in all_active_prods if a.active_in_panel]
            
            if len(all_active_prods) != len(visible_prods):
                print(f"Painel: {panel.name}")
                print(f"  Total (Ativos no BD): {len(all_active_prods)}")
                print(f"  Visíveis no Painel (active_in_panel=True): {len(visible_prods)}")
                
                hidden = [a for a in all_active_prods if not a.active_in_panel]
                print("  Produtos ocultos:")
                for h in hidden:
                    print(f"    - {h.product.nome} (Código: {h.product.codigo})")
            
            # Check for visual duplicates (same name/code) among visible products
            name_code_map = {}
            for a in visible_prods:
                key = (a.product.nome.strip().lower(), (a.product.codigo or '').strip())
                if key in name_code_map:
                    name_code_map[key].append(a)
                else:
                    name_code_map[key] = [a]
            
            duplicates = {k: v for k, v in name_code_map.items() if len(v) > 1}
            if duplicates:
                print(f"Painel: {panel.name} - DUPLICATAS VISUAIS (mesmo nome/código):")
                for key, assocs in duplicates.items():
                    print(f"  - '{key[0]}' (Código: {key[1]}) aparece {len(assocs)} vezes")

if __name__ == "__main__":
    check_active_in_panel()
