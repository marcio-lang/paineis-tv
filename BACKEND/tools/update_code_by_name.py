import sqlite3
import sys

def update_code(db_path: str, name: str, new_code: str):
    con = sqlite3.connect(db_path)
    cur = con.cursor()

    key = name.strip().lower()

    # Verificar se já existe outro produto com o código
    cur.execute("SELECT COUNT(*) FROM butcher_product WHERE codigo=?", (new_code,))
    if cur.fetchone()[0] > 0:
        print(f"Código {new_code} já está em uso. Não atualizado.")
        con.close()
        return

    # Buscar produto por nome
    cur.execute("SELECT id,codigo,nome FROM butcher_product WHERE lower(nome)=?", (key,))
    row = cur.fetchone()
    if not row:
        print(f"Produto '{name}' não encontrado.")
        con.close()
        return

    prod_id, old_code, nome = row
    print(f"Atualizando produto id={prod_id} nome={nome} codigo {old_code} -> {new_code}")
    cur.execute("UPDATE butcher_product SET codigo=?, updated_at=datetime('now') WHERE id=?", (new_code, prod_id))
    con.commit()
    con.close()
    print("Atualização concluída.")

if __name__ == '__main__':
    db = 'instance/paineltv.db'
    n = sys.argv[1] if len(sys.argv) > 1 else 'Acem'
    code = sys.argv[2] if len(sys.argv) > 2 else '175'
    update_code(db, n, code)
