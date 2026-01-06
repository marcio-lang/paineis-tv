from app import app, ButcherProduct

def count_products():
    with app.app_context():
        total = ButcherProduct.query.count()
        active = ButcherProduct.query.filter_by(ativo=True).count()
        print(f"TOTAL DE PRODUTOS: {total}")
        print(f"PRODUTOS ATIVOS: {active}")

if __name__ == "__main__":
    count_products()
