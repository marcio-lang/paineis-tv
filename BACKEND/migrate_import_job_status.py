#!/usr/bin/env python3
import os
import sqlite3

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INSTANCE_DIR = os.path.join(BASE_DIR, 'instance')
DB_PATH = os.path.join(INSTANCE_DIR, 'paineltv.db')

def migrate_import_job():
    print(f"Conectando ao banco de dados em: {DB_PATH}")
    if not os.path.exists(DB_PATH):
        print("Banco de dados nao encontrado. Ele sera inicializado pelo Flask na primeira execucao.")
        return True

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        cursor.execute("PRAGMA table_info(import_job)")
        columns = [col[1] for col in cursor.fetchall()]
        print(f"Colunas atuais da tabela import_job: {columns}")

        modified = False
        if 'status' not in columns:
            print("Adicionando coluna status a tabela import_job...")
            cursor.execute("ALTER TABLE import_job ADD COLUMN status VARCHAR(20) DEFAULT 'completed'")
            print("[OK] Coluna status adicionada.")
            modified = True
        else:
            print("[OK] Coluna status ja existe.")

        if 'error' not in columns:
            print("Adicionando coluna error a tabela import_job...")
            cursor.execute("ALTER TABLE import_job ADD COLUMN error TEXT")
            print("[OK] Coluna error adicionada.")
            modified = True
        else:
            print("[OK] Coluna error ja existe.")

        if modified:
            conn.commit()
            print("[SUCCESS] Migracao de import_job concluida com sucesso!")
        else:
            print("[OK] Nenhuma alteracao de esquema necessaria.")
        
        return True
    except Exception as e:
        conn.rollback()
        print(f"[ERROR] Erro durante a migracao: {e}")
        return False
    finally:
        conn.close()

if __name__ == '__main__':
    migrate_import_job()
