from app import app, db, ProductPanelAssociation
from collections import Counter

def check_duplicate_associations():
    with app.app_context():
        print("\n=== VERIFICANDO DUPLICATAS DE ASSOCIAÇÃO ===")
        assocs = ProductPanelAssociation.query.all()
        
        pairs = [(a.panel_id, a.product_id) for a in assocs]
        counts = Counter(pairs)
        
        duplicates = {k: v for k, v in counts.items() if v > 1}
        
        if not duplicates:
            print("Nenhuma duplicata encontrada.")
        else:
            for (panel_id, product_id), count in duplicates.items():
                print(f"ERRO: Painel {panel_id} tem o produto {product_id} associado {count} vezes!")
                
        print("\n=== VERIFICANDO ASSOCIAÇÕES ÓRFÃS ===")
        orphans = [a for a in assocs if a.product is None]
        if not orphans:
            print("Nenhuma associação órfã encontrada.")
        else:
            for a in orphans:
                print(f"ERRO: Associação {a.id} aponta para produto inexistente {a.product_id}")

if __name__ == "__main__":
    check_duplicate_associations()
