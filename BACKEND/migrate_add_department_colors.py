#!/usr/bin/env python3
"""
Script de migração para adicionar colunas de cores específicas à tabela department
"""

import sqlite3
import os


def migrate_database():
    """Adicionar colunas de cores específicas à tabela department"""
    db_path = 'instance/paineltv.db'

    if not os.path.exists(db_path):
        print(f"Banco de dados {db_path} não encontrado!")
        return False

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Verificar colunas existentes na tabela department
        cursor.execute("PRAGMA table_info(department)")
        columns = [column[1] for column in cursor.fetchall()]

        # Adicionar colunas, se ainda não existirem
        if 'product_name_color' not in columns:
            cursor.execute("ALTER TABLE department ADD COLUMN product_name_color TEXT")
            print("Coluna 'product_name_color' adicionada à tabela department")
        else:
            print("Coluna 'product_name_color' já existe na tabela department")

        if 'price_color' not in columns:
            cursor.execute("ALTER TABLE department ADD COLUMN price_color TEXT")
            print("Coluna 'price_color' adicionada à tabela department")
        else:
            print("Coluna 'price_color' já existe na tabela department")

        if 'price_background_color' not in columns:
            cursor.execute("ALTER TABLE department ADD COLUMN price_background_color TEXT")
            print("Coluna 'price_background_color' adicionada à tabela department")
        else:
            print("Coluna 'price_background_color' já existe na tabela department")

        conn.commit()
        conn.close()

        print("Migração de cores de departamento concluída com sucesso!")
        return True

    except Exception as e:
        print(f"Erro durante a migração: {str(e)}")
        return False


if __name__ == "__main__":
    migrate_database()

