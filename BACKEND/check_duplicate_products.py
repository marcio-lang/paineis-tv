
import sqlite3
import os

def check_duplicate_products_in_db():
    db_path = os.path.join('BACKEND', 'instance', 'paineltv.db')
    if not os.path.exists(db_path):
        db_path = os.path.join('instance', 'paineltv.db')
    
    if not os.path.exists(db_path):
        print(f"Erro: Banco de dados não encontrado.")
        return

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("""
        SELECT codigo, nome, COUNT(*) as count
        FROM butcher_product
        WHERE ativo = 1
        GROUP BY codigo, nome
        HAVING COUNT(*) > 1
    """)
    results = cursor.fetchall()

    if not results:
        print("Nenhum produto duplicado (mesmo código e nome) encontrado.")
    else:
        print(f"Encontrados {len(results)} grupos de produtos duplicados:")
        for r in results:
            print(f"Código: {r['codigo']} | Nome: {r['nome']} | Contagem: {r['count']}")
            
            # List IDs of these products
            cursor.execute("SELECT id, ativo FROM butcher_product WHERE codigo = ? AND nome = ?", (r['codigo'], r['nome']))
            ids = cursor.fetchall()
            for row in ids:
                print(f"  - ID: {row['id']} | Ativo: {row['ativo']}")

    conn.close()

if __name__ == "__main__":
    check_duplicate_products_in_db()
