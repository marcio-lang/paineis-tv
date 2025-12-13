#!/usr/bin/env python3
"""
Script de migração para adicionar campo 'codigo' na tabela ButcherProduct
e gerar códigos únicos para produtos existentes.
"""

import sqlite3
import uuid
from datetime import datetime

def migrate_add_codigo():
    """Adiciona campo codigo e gera códigos únicos para produtos existentes"""
    
    # Conectar ao banco de dados
    conn = sqlite3.connect('instance/paineltv.db')
    cursor = conn.cursor()
    
    try:
        print("🔄 Iniciando migração para adicionar campo 'codigo'...")
        
        # Verificar se a coluna já existe
        cursor.execute("PRAGMA table_info(butcher_product)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'codigo' in columns:
            print("✅ Campo 'codigo' já existe na tabela!")
            return
        
        # Adicionar coluna codigo (temporariamente nullable)
        print("📝 Adicionando coluna 'codigo'...")
        cursor.execute("ALTER TABLE butcher_product ADD COLUMN codigo TEXT")
        
        # Buscar produtos existentes
        cursor.execute("SELECT id, nome, posicao FROM butcher_product WHERE codigo IS NULL")
        produtos_existentes = cursor.fetchall()
        
        print(f"📦 Encontrados {len(produtos_existentes)} produtos sem código")
        
        # Gerar códigos únicos para produtos existentes
        codigos_usados = set()
        
        for produto_id, nome, posicao in produtos_existentes:
            # Gerar código baseado na posição + timestamp
            timestamp = int(datetime.now().timestamp())
            codigo = f"{posicao:03d}{timestamp % 10000:04d}"
            
            # Garantir que o código seja único
            contador = 1
            codigo_original = codigo
            while codigo in codigos_usados:
                codigo = f"{codigo_original[:-2]}{contador:02d}"
                contador += 1
            
            codigos_usados.add(codigo)
            
            # Atualizar produto com o código
            cursor.execute(
                "UPDATE butcher_product SET codigo = ? WHERE id = ?",
                (codigo, produto_id)
            )
            
            print(f"  ✓ Produto '{nome}' recebeu código: {codigo}")
        
        # Criar índice único para o campo codigo
        print("🔧 Criando índice único para campo 'codigo'...")
        cursor.execute("CREATE UNIQUE INDEX idx_butcher_product_codigo ON butcher_product(codigo)")
        
        # Commit das alterações
        conn.commit()
        print("✅ Migração concluída com sucesso!")
        
        # Verificar resultado
        cursor.execute("SELECT COUNT(*) FROM butcher_product WHERE codigo IS NOT NULL")
        total_com_codigo = cursor.fetchone()[0]
        print(f"📊 Total de produtos com código: {total_com_codigo}")
        
    except Exception as e:
        print(f"❌ Erro durante a migração: {e}")
        conn.rollback()
        raise
    
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_add_codigo()