import sqlite3
import os

def check_empty_names():
    db_path = os.path.join(os.getcwd(), 'BACKEND', 'instance', 'paineltv.db')
    if not os.path.exists(db_path):
        print(f"Erro: Banco de dados não encontrado em {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("--- Verificando produtos com nomes vazios ou nulos ---")
    
    # Verificar ButcherProduct
    cursor.execute("SELECT id, codigo, nome, ativo FROM butcher_product WHERE nome IS NULL OR nome = '' OR nome = ' '")
    rows = cursor.fetchall()
    
    if rows:
        print(f"Encontrados {len(rows)} produtos com nome inválido:")
        for row in rows:
            print(f"ID: {row[0]} | Código: {row[1]} | Nome: '{row[2]}' | Ativo: {row[3]}")
    else:
        print("Nenhum produto com nome vazio ou nulo encontrado.")

    conn.close()

if __name__ == "__main__":
    check_empty_names()
