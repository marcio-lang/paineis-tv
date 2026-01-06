
import sqlite3
import os

def list_active_products():
    db_path = os.path.join('BACKEND', 'instance', 'paineltv.db')
    if not os.path.exists(db_path):
        print(f"Erro: Banco de dados não encontrado em {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("--- Listando todos os produtos ATIVOS no banco de dados ---")
    cursor.execute("SELECT id, codigo, nome, preco, posicao, ativo FROM butcher_product WHERE ativo = 1 ORDER BY posicao")
    products = cursor.fetchall()
    
    print(f"Total de produtos ativos: {len(products)}")
    for p in products:
        print(f"ID: {p[0]} | Código: {p[1]} | Nome: {p[2]} | Preço: {p[3]} | Posição: {p[4]}")

    conn.close()

if __name__ == "__main__":
    list_active_products()
