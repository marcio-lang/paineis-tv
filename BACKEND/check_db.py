import sqlite3
import os

# Conectar ao banco de dados correto
db_path = os.path.join('instance', 'paineltv.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Verificar tabelas existentes
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print("Tabelas no banco:")
for table in tables:
    print(f"- {table[0]}")

# Se existe tabela de produtos, verificar quantos registros
if tables:
    for table in tables:
        table_name = table[0]
        if 'produto' in table_name.lower():
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            total = cursor.fetchone()[0]
            print(f"\nTotal de registros na tabela '{table_name}': {total}")
            
            # Verificar se tem coluna is_active
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = cursor.fetchall()
            has_is_active = any('is_active' in col[1] for col in columns)
            
            if has_is_active:
                cursor.execute(f"SELECT COUNT(*) FROM {table_name} WHERE is_active = 1")
                active = cursor.fetchone()[0]
                print(f"Registros ativos: {active}")
            
            # Mostrar algumas colunas da tabela
            print(f"\nColunas da tabela '{table_name}':")
            for col in columns:
                print(f"- {col[1]} ({col[2]})")

conn.close()