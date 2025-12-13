#!/bin/bash

# Script de entrada para corrigir permissões SQLite no Docker

echo "🔧 Iniciando correção de permissões SQLite..."

# Criar diretórios se não existirem
mkdir -p /app/uploads /app/instance

# Corrigir permissões dos diretórios
chmod -R 755 /app/uploads /app/instance

# Se o banco SQLite existe, corrigir suas permissões
if [ -f "/app/instance/paineltv.db" ]; then
    echo "📁 Banco SQLite encontrado, corrigindo permissões..."
    chmod 666 /app/instance/paineltv.db
else
    echo "📁 Banco SQLite não encontrado, será criado automaticamente..."
fi

# Garantir que o diretório instance seja gravável
chmod 777 /app/instance

echo "✅ Permissões corrigidas com sucesso!"

# Executar o comando original
exec "$@"