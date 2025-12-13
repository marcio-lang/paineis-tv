#!/usr/bin/env python3
import requests
import json

# Dados dos 226 produtos
produtos_data = []

# Ler o arquivo TXT e converter para JSON
with open('ITENSMGV_TEST.TXT', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line:
            parts = line.split('|')
            if len(parts) >= 4:
                codigo = parts[0]
                nome = parts[1]
                preco = parts[2]  # Formato "XX,XX"
                ativo = parts[3] == 'S'
                
                produto = {
                    'nome': nome,
                    'preco': preco,
                    'ativo': ativo
                }
                produtos_data.append(produto)

print(f"Preparando importação de {len(produtos_data)} produtos...")

# Fazer a requisição POST para o endpoint de importação
url = 'http://localhost:5000/api/acougue/import-processed'
headers = {'Content-Type': 'application/json'}

# O endpoint espera um objeto com a chave 'produtos'
payload = {'produtos': produtos_data}

try:
    response = requests.post(url, json=payload, headers=headers)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Importação realizada com sucesso!")
        print(f"📊 Resultado: {result}")
    else:
        print(f"❌ Erro na importação: {response.status_code}")
        print(f"Resposta: {response.text}")
        
except Exception as e:
    print(f"❌ Erro na requisição: {e}")