#!/usr/bin/env python3
"""
Migração para adicionar colunas title, subtitle e footer_text na tabela butcher_panel_config
"""

import sqlite3
import os
import sys

def migrate_butcher_config():
    """Adiciona as colunas necessárias na tabela butcher_panel_config"""
    
    # Caminho do banco de dados
    db_path = os.path.join(os.path.dirname(__file__), 'instance', 'paineltv.db')
    
    if not os.path.exists(db_path):
        print(f"❌ Banco de dados não encontrado: {db_path}")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🔍 Verificando estrutura atual da tabela butcher_panel_config...")
        
        # Verificar se as colunas já existem
        cursor.execute("PRAGMA table_info(butcher_panel_config)")
        columns = [row[1] for row in cursor.fetchall()]
        print(f"Colunas atuais: {columns}")
        
        # Adicionar colunas se não existirem
        columns_to_add = [
            ('title', 'TEXT DEFAULT ""'),
            ('subtitle', 'TEXT DEFAULT ""'),
            ('footer_text', 'TEXT DEFAULT ""')
        ]
        
        for column_name, column_def in columns_to_add:
            if column_name not in columns:
                print(f"➕ Adicionando coluna {column_name}...")
                cursor.execute(f"ALTER TABLE butcher_panel_config ADD COLUMN {column_name} {column_def}")
                print(f"✅ Coluna {column_name} adicionada com sucesso!")
            else:
                print(f"ℹ️  Coluna {column_name} já existe")
        
        # Verificar se existe pelo menos um registro de configuração
        cursor.execute("SELECT COUNT(*) FROM butcher_panel_config")
        count = cursor.fetchone()[0]
        
        if count == 0:
            print("➕ Criando registro de configuração padrão...")
            cursor.execute("""
                INSERT INTO butcher_panel_config 
                (polling_interval, title, subtitle, footer_text, created_at, updated_at)
                VALUES (10, 'AÇOUGUE PREMIUM', 'Carnes Selecionadas', '', datetime('now'), datetime('now'))
            """)
            print("✅ Registro de configuração padrão criado!")
        
        conn.commit()
        conn.close()
        
        print("🎉 Migração concluída com sucesso!")
        return True
        
    except Exception as e:
        print(f"❌ Erro durante a migração: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Iniciando migração da configuração do açougue...")
    success = migrate_butcher_config()
    sys.exit(0 if success else 1)