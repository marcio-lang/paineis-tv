import sqlite3
import json
import sys

db_path = 'instance/paineltv.db'
name = 'acem'
if len(sys.argv) > 1:
    name = sys.argv[1].lower()

con = sqlite3.connect(db_path)
con.row_factory = sqlite3.Row
cur = con.cursor()
cur.execute("SELECT id,codigo,nome,preco,posicao,ativo,created_at,updated_at FROM butcher_product WHERE lower(nome)=? ORDER BY posicao", (name,))
rows = [dict(r) for r in cur.fetchall()]
print(json.dumps(rows, ensure_ascii=False, indent=2))
con.close()
