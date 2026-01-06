
import sqlite3
import os

def check_db_prices():
    db_path = os.path.join('BACKEND', 'instance', 'paineltv.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("--- Produtos no Painel Açougue com Preços ---")
    # ID do Painel Açougue obtido anteriormente: 99751091-5f68-4619-a875-9b9f3d0502c6
    panel_id = '99751091-5f68-4619-a875-9b9f3d0502c6'
    
    cursor.execute("""
        SELECT 
            p.id, p.codigo, p.nome, p.preco, p.ativo, 
            a.position_override
        FROM product_panel_association a
        JOIN butcher_product p ON a.product_id = p.id
        WHERE a.panel_id = ?
    """, (panel_id,))
    
    products = cursor.fetchall()
    for prod in products:
        pid, codigo, nome, preco, ativo, pos = prod
        print(f"Nome: '{nome}' | Preço: {preco} | Cod: {codigo} | Pos: {pos}")

    print("\n--- Verificando Keywords do Departamento Açougue ---")
    cursor.execute("""
        SELECT d.name, d.keywords 
        FROM department d 
        JOIN department_panel dp ON d.id = dp.department_id 
        WHERE dp.id = ?
    """, (panel_id,))
    dept = cursor.fetchone()
    if dept:
        print(f"Dept: {dept[0]} | Keywords: {dept[1]}")

    conn.close()

if __name__ == "__main__":
    check_db_prices()
