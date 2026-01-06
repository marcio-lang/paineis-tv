
import os
import sys
import sqlite3

db_path = os.path.join(os.getcwd(), 'BACKEND', 'instance', 'paineltv.db')

def check_schema():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='product_panel_association'")
    result = cursor.fetchone()
    if result:
        print(result[0])
    
    # Também verificar se existem duplicatas reais ignorando o modelo
    cursor.execute("SELECT product_id, panel_id, COUNT(*) FROM product_panel_association GROUP BY product_id, panel_id HAVING COUNT(*) > 1")
    duplicates = cursor.fetchall()
    if duplicates:
        print("\nDUPLICATAS ENCONTRADAS NO SQLITE:")
        for d in duplicates:
            print(f"Product: {d[0]}, Panel: {d[1]}, Count: {d[2]}")
    else:
        print("\nNenhuma duplicata encontrada no SQLITE.")
    
    conn.close()

if __name__ == "__main__":
    check_schema()
