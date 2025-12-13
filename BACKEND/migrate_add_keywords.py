#!/usr/bin/env python3
"""
Script de migração para adicionar a coluna keywords à tabela department
"""

import sqlite3
import json
import os

def migrate_database():
    """Adicionar coluna keywords à tabela department"""
    db_path = 'instance/paineltv.db'
    
    if not os.path.exists(db_path):
        print(f"Banco de dados {db_path} não encontrado!")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Verificar se a coluna já existe
        cursor.execute("PRAGMA table_info(department)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'keywords' in columns:
            print("Coluna 'keywords' já existe na tabela department")
        else:
            # Adicionar a coluna keywords
            cursor.execute("ALTER TABLE department ADD COLUMN keywords TEXT")
            print("Coluna 'keywords' adicionada à tabela department")
        
        # Atualizar departamentos existentes com palavras-chave padrão
        default_keywords = {
            'ACG': ['carne', 'boi', 'porco', 'frango', 'linguiça', 'costela', 'picanha', 'alcatra', 'maminha', 'patinho', 'acém', 'músculo'],
            'PAD': ['pão', 'bolo', 'torta', 'biscoito', 'doce', 'salgado', 'croissant', 'sonho', 'rosquinha', 'broa'],
            'HRT': ['alface', 'tomate', 'cebola', 'batata', 'cenoura', 'abobrinha', 'pepino', 'pimentão', 'banana', 'maçã', 'laranja', 'limão']
        }
        
        # Buscar departamentos existentes
        cursor.execute("SELECT id, code FROM department WHERE keywords IS NULL OR keywords = ''")
        departments = cursor.fetchall()
        
        for dept_id, dept_code in departments:
            if dept_code in default_keywords:
                keywords_json = json.dumps(default_keywords[dept_code])
                cursor.execute("UPDATE department SET keywords = ? WHERE id = ?", (keywords_json, dept_id))
                print(f"Palavras-chave padrão adicionadas ao departamento {dept_code}")
        
        conn.commit()
        conn.close()
        
        print("Migração concluída com sucesso!")
        return True
        
    except Exception as e:
        print(f"Erro durante a migração: {str(e)}")
        return False

if __name__ == "__main__":
    migrate_database()