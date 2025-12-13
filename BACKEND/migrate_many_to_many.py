#!/usr/bin/env python3
"""
Script para migrar o banco de dados de relacionamento 1:N para N:N entre Action e Panel
"""

import sqlite3
import os
import sys

# Adicionar o diretório do backend ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def migrate_to_many_to_many():
    """Migra o banco de dados para suportar relacionamento many-to-many"""
    
    db_path = os.path.join(os.path.dirname(__file__), 'instance', 'paineltv.db')
    
    if not os.path.exists(db_path):
        print(f"Banco de dados não encontrado: {db_path}")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("Iniciando migração para relacionamento many-to-many...")
        
        # 1. Criar tabela de associação action_panel
        print("1. Criando tabela de associação action_panel...")
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS action_panel (
                action_id TEXT NOT NULL,
                panel_id TEXT NOT NULL,
                PRIMARY KEY (action_id, panel_id),
                FOREIGN KEY (action_id) REFERENCES action (id) ON DELETE CASCADE,
                FOREIGN KEY (panel_id) REFERENCES panel (id) ON DELETE CASCADE
            )
        ''')
        
        # 2. Migrar dados existentes da tabela action
        print("2. Migrando dados existentes...")
        cursor.execute('''
            INSERT OR IGNORE INTO action_panel (action_id, panel_id)
            SELECT id, panel_id FROM action WHERE panel_id IS NOT NULL
        ''')
        
        # 3. Criar nova tabela action sem panel_id
        print("3. Criando nova estrutura da tabela action...")
        cursor.execute('''
            CREATE TABLE action_new (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                start_date DATETIME NOT NULL,
                end_date DATETIME NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 4. Copiar dados da tabela action (exceto panel_id)
        print("4. Copiando dados da tabela action...")
        cursor.execute('''
            INSERT INTO action_new (id, name, start_date, end_date, created_at, updated_at)
            SELECT id, name, start_date, end_date, created_at, updated_at FROM action
        ''')
        
        # 5. Remover tabela action antiga e renomear a nova
        print("5. Atualizando estrutura da tabela action...")
        cursor.execute('DROP TABLE action')
        cursor.execute('ALTER TABLE action_new RENAME TO action')
        
        # 6. Recriar índices se necessário
        print("6. Recriando índices...")
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_action_start_date ON action(start_date)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_action_end_date ON action(end_date)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_action_panel_action_id ON action_panel(action_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_action_panel_panel_id ON action_panel(panel_id)')
        
        conn.commit()
        
        # Verificar migração
        print("\n7. Verificando migração...")
        cursor.execute("SELECT COUNT(*) FROM action_panel")
        associations_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM action")
        actions_count = cursor.fetchone()[0]
        
        print(f"   - Ações migradas: {actions_count}")
        print(f"   - Associações criadas: {associations_count}")
        
        conn.close()
        print("\n✅ Migração concluída com sucesso!")
        return True
        
    except Exception as e:
        print(f"❌ Erro durante a migração: {e}")
        if 'conn' in locals():
            conn.roll