#!/usr/bin/env python3
"""
Script de migração para adicionar a coluna has_border na tabela action
"""

import sqlite3
import os
import sys

def migrate_database():
    """Adiciona a coluna has_border na tabela action se ela não existir"""
    
    # Caminho para o banco de dados
    base_dir = os.path.dirname(os.path.abspath(__file__))
    instance_dir = os.path.join(base_dir, 'instance')
    db_path = os.path.join(instance_dir, 'paineltv.db')
    
    if not os.path.exists(db_path):
        print(f"Banco de dados não encontrado em: {db_path}")
        return False
    
    try:
        # Conectar ao banco
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Verificar se a coluna já existe
        cursor.execute("PRAGMA table_info(action)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'has_border' in columns:
            print("Coluna 'has_border' já existe na tabela 'action'")
            conn.close()
            return True
        
        # Adicionar a coluna has_border
        print("Adicionando coluna 'has_border' na tabela 'action'...")
        cursor.execute("ALTER TABLE action ADD COLUMN has_border BOOLEAN DEFAULT 0")
        
        # Confirmar as mudanças
        conn.commit()
        
        # Verificar se a coluna foi adicionada
        cursor.execute("PRAGMA table_info(action)")
        columns_after = [column[1] for column in cursor.fetchall()]
        
        if 'has_border' in columns_after:
            print("✅ Coluna 'has_border' adicionada com sucesso!")
            
            # Mostrar estrutura da tabela atualizada
            print("\nEstrutura atual da tabela 'action':")
            cursor.execute("PRAGMA table_info(action)")
            for column in cursor.fetchall():
                print(f"  - {column[1]} ({column[2]}) {'NOT NULL' if column[3] else 'NULL'} {'DEFAULT ' + str(column[4]) if column[4] else ''}")
            
            conn.close()
            return True
        else:
            print("❌ Erro: Coluna não foi adicionada")
            conn.close()
            return False
            
    except sqlite3.Error as e:
        print(f"❌ Erro SQLite: {e}")
        if conn:
            conn.close()
        return False
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        if conn:
            conn.close()
        return False

if __name__ == "__main__":
    print("🔄 Iniciando migração do banco de dados...")
    success = migrate_database()
    
    if success:
        print("✅ Migração concluída com sucesso!")
        sys.exit(0)
    else:
        print("❌ Migração falhou!")
        sys.exit(1)