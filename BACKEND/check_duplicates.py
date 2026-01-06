
import sys
import os

sys.path.append(os.getcwd())

from app import app, db, ButcherProduct

def check_duplicates():
    with app.app_context():
        print("\n=== VERIFICANDO DUPLICATAS DE PRODUTOS (NOME OU CÓDIGO) ===")
        products = ButcherProduct.query.all()
        
        names = {}
        codigos = {}
        
        for p in products:
            if p.nome in names:
                names[p.nome].append(p)
            else:
                names[p.nome] = [p]
                
            if p.codigo in codigos:
                codigos[p.codigo].append(p)
            else:
                codigos[p.codigo] = [p]
        
        print("\nPRODUTOS COM MESMO NOME:")
        for name, prods in names.items():
            if len(prods) > 1:
                print(f"  - '{name}': {len(prods)} ocorrências")
                for p in prods:
                    print(f"    - ID: {p.id}, Código: {p.codigo}, Ativo: {p.ativo}")
        
        print("\nPRODUTOS COM MESMO CÓDIGO:")
        for codigo, prods in codigos.items():
            if len(prods) > 1:
                print(f"  - '{codigo}': {len(prods)} ocorrências")
                for p in prods:
                    print(f"    - ID: {p.id}, Nome: {p.nome}, Ativo: {p.ativo}")

if __name__ == "__main__":
    check_duplicates()
