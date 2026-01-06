from app import app, DepartmentPanel, ProductPanelAssociation, ButcherProduct

def diagnose_all_panels():
    with app.app_context():
        print("\n=== DIAGNÓSTICO DE CONTAGEM POR PAINEL ===")
        panels = DepartmentPanel.query.all()
        for p in panels:
            # 1. Count from to_dict()
            dict_count = p.to_dict()['products_count']
            
            # 2. Count from associations (active products)
            active_assocs = [a for a in p.product_associations if a.product and a.product.ativo]
            actual_count = len(active_assocs)
            
            # 3. Count from associations (active in panel)
            visible_assocs = [a for a in active_assocs if a.active_in_panel]
            visible_count = len(visible_assocs)
            
            if dict_count != actual_count or dict_count != visible_count:
                print(f"PAINEL: {p.name} (ID: {p.id})")
                print(f"  - to_dict count: {dict_count}")
                print(f"  - active product assocs: {actual_count}")
                print(f"  - visible (active_in_panel) assocs: {visible_count}")
                
                if actual_count != visible_count:
                    print(f"  - AVISO: {actual_count - visible_count} produtos estão inativos NO PAINEL (active_in_panel=False)")

if __name__ == "__main__":
    diagnose_all_panels()
