#!/usr/bin/env python3
"""
Script para adicionar as novas colunas layout_type e fixed_url à tabela Panel
"""

import os
import sqlite3
import uuid
from datetime import datetime

# Configurações do banco
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INSTANCE_DIR = os.path.join(BASE_DIR, 'instance')
DB_PATH = os.path.join(INSTANCE_DIR, 'paineltv.db')

def add_columns():
    """Adiciona as colunas layout_type e fixed_url à tabela Panel"""
    print("Conectando ao banco de dados...")
    
    if not os.path.exists(DB_PATH):
        print(f"Erro: Banco de dados não encontrado em {DB_PATH}")
        return False
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Verificar se as colunas já existem
        cursor.execute("PRAGMA table_info(panel)")
        columns = [column[1] for column in cursor.fetchall()]
        print(f"Colunas atuais da tabela panel: {columns}")
        
        # Adicionar coluna layout_type se não existir
        if 'layout_type' not in columns:
            print("Adicionando coluna layout_type...")
            cursor.execute("ALTER TABLE panel ADD COLUMN layout_type VARCHAR(20) DEFAULT 'layout_1'")
            print("✓ Coluna layout_type adicionada")
        else:
            print("✓ Coluna layout_type já existe")
        
        # Adicionar coluna fixed_url se não existir
        if 'fixed_url' not in columns:
            print("Adicionando coluna fixed_url...")
            cursor.execute("ALTER TABLE panel ADD COLUMN fixed_url VARCHAR(100)")
            print("✓ Coluna fixed_url adicionada")
            
            # Gerar URLs fixas para painéis existentes que não têm
            print("Gerando URLs fixas para painéis existentes...")
            cursor.execute("SELECT id FROM panel WHERE fixed_url IS NULL OR fixed_url = ''")
            panels_without_url = cursor.fetchall()
            
            for (panel_id,) in panels_without_url:
                fixed_url = str(uuid.uuid4())[:8]
                cursor.execute("UPDATE panel SET fixed_url = ? WHERE id = ?", (fixed_url, panel_id))
                print(f"  - Painel {panel_id}: URL fixa gerada {fixed_url}")
        else:
            print("✓ Coluna fixed_url já existe")
        
        # Adicionar coluna updated_at se não existir
        if 'updated_at' not in columns:
            print("Adicionando coluna updated_at...")
            cursor.execute("ALTER TABLE panel ADD COLUMN updated_at DATETIME")
            # Definir valor padrão para registros existentes
            cursor.execute("UPDATE panel SET updated_at = created_at WHERE updated_at IS NULL")
            print("✓ Coluna updated_at adicionada")
        else:
            print("✓ Coluna updated_at já existe")
        
        # Atualizar painéis que não têm layout_type definido
        cursor.execute("UPDATE panel SET layout_type = 'layout_1' WHERE layout_type IS NULL OR layout_type = ''")
        updated_layouts = cursor.rowcount
        if updated_layouts > 0:
            print(f"✓ {updated_layouts} painéis atualizados com layout_type padrão")
        
        # Commit das mudanças
        conn.commit()
        print("\n✅ Colunas adicionadas com sucesso!")
        
        # Verificar estrutura final
        cursor.execute("PRAGMA table_info(panel)")
        final_columns = [column[1] for column in cursor.fetchall()]
        print(f"Estrutura final da tabela panel: {final_columns}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao adicionar colunas: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

if __name__ == '__main__':
    success = add_columns()
    if success:
        print("\n🎉 Pronto! Agora você pode executar o script de migração:")
        print("python migrate_data.py")
    else:
        print("\n❌ Falha ao adicionar colunas. Verifique os erros acima.")