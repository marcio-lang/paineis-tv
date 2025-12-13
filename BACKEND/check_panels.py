import sqlite3

# Conectar ao banco
conn = sqlite3.connect('instance/paineltv.db')
cursor = conn.cursor()

# Verificar estrutura da tabela panel
cursor.execute("PRAGMA table_info(panel)")
columns = cursor.fetchall()
print("Estrutura da tabela 'panel':")
for col in columns:
    print(f"- {col[1]} ({col[2]})")

# Buscar todos os painéis
cursor.execute("SELECT * FROM panel")
panels = cursor.fetchall()
print(f"\nPainéis encontrados: {len(panels)}")

for i, panel in enumerate(panels):
    print(f"\nPainel {i+1}:")
    for j, col in enumerate(columns):
        print(f"  {col[1]}: {panel[j] if j < len(panel) else 'N/A'}")

conn.close()