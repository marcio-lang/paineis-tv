import sqlite3
import sys

def delete_products_by_name(db_path: str, name: str):
    con = sqlite3.connect(db_path)
    cur = con.cursor()

    # Normalizar nome
    key = name.strip().lower()

    # Buscar produtos
    cur.execute(
        "SELECT id,codigo,nome FROM butcher_product WHERE lower(nome)=?",
        (key,)
    )
    rows = cur.fetchall()
    ids = [r[0] for r in rows]

    print(f"Encontrados {len(ids)} produtos com nome '{name}':")
    for r in rows:
        print(f" - id={r[0]} codigo={r[1]} nome={r[2]}")

    if not ids:
        con.close()
        return

    # Remover associações órfãs primeiro
    cur.execute(
        f"DELETE FROM product_panel_association WHERE product_id IN ({','.join('?' for _ in ids)})",
        ids
    )
    assoc_deleted = cur.rowcount
    print(f"Associações removidas: {assoc_deleted}")

    # Remover produtos
    cur.execute(
        f"DELETE FROM butcher_product WHERE id IN ({','.join('?' for _ in ids)})",
        ids
    )
    prod_deleted = cur.rowcount
    print(f"Produtos removidos: {prod_deleted}")

    con.commit()

    # Verificação final
    cur.execute(
        "SELECT COUNT(*) FROM butcher_product WHERE lower(nome)=?",
        (key,)
    )
    remaining = cur.fetchone()[0]
    print(f"Restantes com nome '{name}': {remaining}")

    # Verificar associações órfãs gerais
    cur.execute(
        "SELECT COUNT(*) FROM product_panel_association WHERE product_id NOT IN (SELECT id FROM butcher_product)"
    )
    orphans = cur.fetchone()[0]
    print(f"Associações órfãs restantes: {orphans}")

    con.close()

if __name__ == '__main__':
    db = 'instance/paineltv.db'
    n = sys.argv[1] if len(sys.argv) > 1 else 'acem'
    delete_products_by_name(db, n)
