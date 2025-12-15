# 🚀 GUIA COMPLETO DE DEPLOY - TEMPLATE

> **📚 O QUE É ESTE DOCUMENTO?**
> 
> Este é um guia passo-a-passo para fazer deploy de aplicações web usando Docker + VPS + Git.
> 
> **Stack assumida:** Frontend (React/Vue/Angular) + Backend (Node.js) + MySQL/PostgreSQL
> 
> **Infraestrutura:** Docker Compose rodando em VPS Linux (Ubuntu/Debian)

---

## 📋 ÍNDICE

1. [Pré-requisitos](#-pré-requisitos)
2. [Arquitetura do Projeto](#-arquitetura-do-projeto)
3. [Configuração Inicial da VPS](#-configuração-inicial-da-vps)
4. [Deploy de Versão Local para VPS](#-deploy-de-versão-local-para-vps)
5. [Troca de Ambiente (Dev ↔ Prod)](#-troca-de-ambiente-dev--prod)
6. [Migrations do Banco de Dados](#-migrations-do-banco-de-dados)
7. [Resolução de Problemas](#-resolução-de-problemas-comuns)
8. [Comandos Úteis](#-comandos-úteis)
9. [Checklist de Deploy](#-checklist-de-deploy)

---

## 📦 PRÉ-REQUISITOS

### No seu computador local (onde você desenvolve):

| Ferramenta | Para que serve | Como verificar |
|------------|----------------|----------------|
| **Git** | Controle de versão do código | `git --version` |
| **Node.js** | Executar o backend e build do frontend | `node --version` |
| **Docker** | Containerização (opcional local) | `docker --version` |
| **SSH Client** | Conectar na VPS | `ssh -V` |

### Na VPS (servidor remoto):

| Ferramenta | Para que serve | Como instalar |
|------------|----------------|---------------|
| **Docker** | Rodar os containers | [Ver seção de instalação](#instalar-docker-na-vps) |
| **Docker Compose** | Orquestrar múltiplos containers | Vem junto com Docker |
| **Git** | Baixar código do repositório | `apt install git` |

### O que você precisa ter em mãos:

```
✅ IP da sua VPS (ex: 123.45.67.89)
✅ Usuário da VPS (geralmente 'root' ou um usuário sudo)
✅ Chave SSH configurada (recomendado) OU senha do usuário
✅ Domínio apontando para a VPS (opcional, mas recomendado)
✅ Repositório Git do projeto (GitHub, GitLab, Bitbucket, etc.)
```

---

## 🏗 ARQUITETURA DO PROJETO

### Estrutura de Pastas Esperada

```
meu-projeto/
├── backend/                    # Código do servidor (API)
│   ├── Dockerfile             # 📄 Instruções para criar imagem Docker do backend
│   ├── package.json           # 📄 Dependências do Node.js
│   ├── prisma/                # 📁 Migrations do banco (se usar Prisma)
│   │   └── schema.prisma
│   ├── src/                   # 📁 Código fonte
│   └── .env                   # 📄 Variáveis de ambiente (NÃO commitar!)
│
├── frontend/                   # Código do cliente (interface)
│   ├── Dockerfile             # 📄 Instruções para criar imagem Docker do frontend
│   ├── nginx.conf             # 📄 Configuração do servidor web
│   ├── package.json           # 📄 Dependências do Node.js
│   └── src/                   # 📁 Código fonte
│
├── docker-compose.yml          # 📄 Configuração de PRODUÇÃO
├── docker-compose.dev.yml      # 📄 Configuração de DESENVOLVIMENTO
├── switch-to-prod.sh           # 📜 Script para trocar para produção
├── switch-to-dev.sh            # 📜 Script para trocar para desenvolvimento
└── .env.example                # 📄 Exemplo de variáveis de ambiente
```

### Como os Containers se Comunicam

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TRAEFIK (Reverse Proxy)                      │
│              Gerencia SSL/HTTPS e roteia requisições            │
│                    Porta 80 e 443 abertas                       │
└──────────────┬─────────────────────────────┬────────────────────┘
               │                             │
               ▼                             ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│      FRONTEND            │    │       BACKEND (API)      │
│   (nginx + React/Vue)    │    │    (Node.js + Express)   │
│     app.seudominio.com   │    │   api.seudominio.com     │
│        Porta 80          │    │       Porta 3001         │
└──────────────────────────┘    └────────────┬─────────────┘
                                             │
                                             ▼
                                ┌──────────────────────────┐
                                │     BANCO DE DADOS       │
                                │    (MySQL/PostgreSQL)    │
                                │       Porta 3306         │
                                └──────────────────────────┘
```

---

## 🖥 CONFIGURAÇÃO INICIAL DA VPS

> **⚠️ FAÇA ISSO APENAS UMA VEZ** - na primeira vez que configurar o servidor

### 1️⃣ Conectar na VPS pela primeira vez

```bash
# Conectar via SSH (substitua os valores)
ssh root@212.85.10.184

# Exemplo:
ssh root@123.45.67.89
```

### 2️⃣ Instalar Docker na VPS

```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar dependências
apt install -y curl git

# Instalar Docker (script oficial)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Verificar instalação
docker --version
docker compose version
```

### 3️⃣ Clonar o Repositório

```bash
# Criar pasta do projeto
cd /root  # ou /home/seu-usuario

# Clonar repositório (substitua pela URL do seu repo)
git clone https://github.com/marcio-lang/paineis-tv.git
cd seu-projeto

# Verificar se está tudo lá
ls -la
```

### 4️⃣ Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example backend/.env

# Editar com suas configurações
nano backend/.env
```

**Exemplo de `.env` para produção:**

```env
# ========================
# AMBIENTE
# ========================
NODE_ENV=production

# ========================
# BANCO DE DADOS
# ========================
# Formato: mysql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO
DATABASE_URL="mysql://root:sua_senha_segura@db:3306/nome_do_banco"

# ========================
# JWT (Autenticação)
# ========================
JWT_SECRET="sua_chave_secreta_muito_longa_e_segura_aqui"
JWT_EXPIRES_IN="7d"

# ========================
# SERVIDOR
# ========================
PORT=3001

# ========================
# CORS (Domínios permitidos)
# ========================
CORS_ORIGIN="https://app.seudominio.com,https://seudominio.com"
```

### 5️⃣ Configurar Chave SSH (Recomendado)

> **Por que usar chave SSH?** Mais seguro que senha e não precisa digitar toda vez.

**No seu computador local:**

```bash
# Gerar chave SSH (se ainda não tiver)
ssh-keygen -t ed25519 -C "seu-email@example.com" -f ~/.ssh/id_ed25519_meu_projeto

# Ver a chave pública (copiar este conteúdo)
cat ~/.ssh/id_ed25519_meu_projeto.pub
```

**Na VPS:**

```bash
# Criar pasta se não existir
mkdir -p ~/.ssh

# Colar a chave pública
echo "COLE_A_CHAVE_PUBLICA_AQUI" >> ~/.ssh/authorized_keys

# Ajustar permissões
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

**Testar conexão:**

```bash
# Agora conectar usando a chave
ssh -i ~/.ssh/id_ed25519_meu_projeto root@SEU_IP_DA_VPS
```


||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||| INÍCIO DA DEPLOY ROTINE
---

## 🚀 DEPLOY DE VERSÃO LOCAL PARA VPS

> **📍 SITUAÇÃO:** Você fez alterações no código local e quer enviar para produção.

### Etapa 1: Preparar código local

```bash
# 1. Ver o que foi alterado
git status

# 2. Ver últimos commits
git log --oneline -5

# 3. Adicionar todas as alterações
git add .

# 4. Criar commit com descrição clara
git commit -m "feat: descrição do que foi feito"
# Exemplos de boas mensagens:
# - "fix: corrigido bug no login"
# - "feat: adicionado filtro de busca"
# - "style: ajustado layout do dashboard"

# 5. Enviar para o repositório remoto
git push origin main
# ou: git push origin master (depende do nome da branch)
```

### Etapa 2: Conectar na VPS

```bash
# Com chave SSH (recomendado)
ssh -i ~/.ssh/sua_chave root@SEU_IP

# Ou com senha
ssh root@SEU_IP

# Navegar para pasta do projeto
cd /root/seu-projeto  # ajuste o caminho
```

### Etapa 3: Atualizar código na VPS

```bash
# Descartar alterações locais (se houver)
git reset --hard HEAD

# Baixar últimas alterações
git fetch --all

# Forçar atualização para versão do repositório
git reset --hard origin/main  # ou origin/master

# Verificar se atualizou
git log --oneline -1
```

### Etapa 4: Executar deploy

```bash
# Dar permissão ao script (se necessário)
chmod +x switch-to-prod.sh

# Executar deploy
./switch-to-prod.sh
```

### Etapa 5: Verificar se funcionou

```bash
# Ver containers rodando
docker ps

# Ver logs (últimas 50 linhas)
docker compose logs --tail=50

# Testar se API responde
curl http://localhost:3001/health
# ou
curl https://api.seudominio.com/health
```

||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||| FIM DA DEPLOY ROTINE

---

## 🔄 TROCA DE AMBIENTE (DEV ↔ PROD)

### O que é isso?

- **Produção (prod):** Ambiente real, usado pelos usuários finais
- **Desenvolvimento (dev):** Ambiente de testes, com hot-reload e debug

### Trocar para PRODUÇÃO

```bash
./switch-to-prod.sh
```

**O que o script faz:**
1. ✅ Define `NODE_ENV=production`
2. ✅ Para containers antigos
3. ✅ Rebuilda imagens com cache limpo
4. ✅ Inicia containers de produção
5. ✅ Aplica migrations pendentes do banco

### Trocar para DESENVOLVIMENTO

```bash
./switch-to-dev.sh
```

**O que o script faz:**
1. ✅ Define `NODE_ENV=development`
2. ✅ Inicia com hot-reload (código atualiza sem rebuild)
3. ✅ Logs mais detalhados para debug

### Verificar ambiente atual

```bash
# Ver variável de ambiente
grep NODE_ENV backend/.env

# Ver containers ativos
docker ps --format "table {{.Names}}\t{{.Status}}"
```

---

## 🗄 MIGRATIONS DO BANCO DE DADOS

### O que são migrations?

> **Migrations** são "versões" do seu banco de dados. Cada migration representa uma alteração na estrutura (criar tabela, adicionar coluna, etc.)

### Verificar status das migrations

```bash
# Entrar no container da API
docker exec -it NOME_DO_CONTAINER_API sh

# Ver status (quais migrations foram aplicadas)
npx prisma migrate status

# Sair do container
exit
```

**Ou diretamente:**

```bash
docker exec NOME_DO_CONTAINER_API npx prisma migrate status
```

### Aplicar migrations pendentes

```bash
docker exec NOME_DO_CONTAINER_API npx prisma migrate deploy
```

### Criar nova migration (desenvolvimento)

```bash
# No seu computador local, após alterar schema.prisma
cd backend
npx prisma migrate dev --name descricao_da_alteracao

# Exemplo:
npx prisma migrate dev --name adicionar_campo_telefone_usuario
```

### Erros comuns

| Erro | Causa | Solução |
|------|-------|---------|
| "Table already exists" | Tabela existe mas migration não foi registrada | `docker exec CONTAINER npx prisma migrate resolve --applied NOME_MIGRATION` |
| "Unknown column" | Falta aplicar migration | `docker exec CONTAINER npx prisma migrate deploy` |
| "Connection refused" | Banco não está rodando | `docker compose up -d db` |

---

## 🔧 RESOLUÇÃO DE PROBLEMAS COMUNS

### ❌ "Permission denied" ao executar script

```bash
# Dar permissão de execução
chmod +x switch-to-prod.sh

# Ou executar com bash
bash switch-to-prod.sh
```

### ❌ Container não inicia / fica reiniciando

```bash
# Ver logs do container específico
docker logs NOME_DO_CONTAINER --tail=100

# Ver logs de todos os containers
docker compose logs --tail=50

# Comum: variável de ambiente faltando
# Verifique o arquivo .env
```

### ❌ Erro de conexão com banco de dados

```bash
# Verificar se container do banco está rodando
docker ps | grep db

# Testar conexão manual
docker exec -it CONTAINER_DO_BANCO mysql -u root -p

# Verificar DATABASE_URL no .env
# Formato correto: mysql://usuario:senha@host:porta/banco
```

### ❌ Site não abre (erro 502 ou timeout)

```bash
# Verificar se containers estão rodando
docker ps

# Verificar logs
docker compose logs frontend --tail=50
docker compose logs api --tail=50

# Reiniciar tudo
docker compose down
docker compose up -d
```

### ❌ Alterações não aparecem no site

```bash
# Forçar rebuild das imagens
docker compose down
docker compose up --build --force-recreate -d

# Limpar cache do Docker (último recurso)
docker system prune -f
docker compose up --build -d
```

### ❌ Erro de memória / espaço em disco

```bash
# Ver uso de disco
df -h

# Limpar imagens e containers não usados
docker system prune -a -f

# Ver uso do Docker
docker system df
```

---

## 📋 COMANDOS ÚTEIS

### Docker

| Comando | O que faz |
|---------|-----------|
| `docker ps` | Lista containers rodando |
| `docker ps -a` | Lista TODOS os containers (inclusive parados) |
| `docker compose up -d` | Inicia containers em background |
| `docker compose down` | Para e remove containers |
| `docker compose logs -f` | Mostra logs em tempo real |
| `docker compose logs SERVICO --tail=50` | Últimas 50 linhas de log de um serviço |
| `docker exec -it CONTAINER sh` | Entrar dentro do container |
| `docker stats` | Uso de CPU/memória dos containers |
| `docker system prune -f` | Limpar recursos não usados |

### Git

| Comando | O que faz |
|---------|-----------|
| `git status` | Ver arquivos modificados |
| `git log --oneline -10` | Últimos 10 commits |
| `git pull origin main` | Baixar alterações do repositório |
| `git reset --hard HEAD` | Descartar alterações locais |
| `git checkout HASH` | Voltar para versão específica |

### Prisma (Banco de Dados)

| Comando | O que faz |
|---------|-----------|
| `npx prisma migrate status` | Ver status das migrations |
| `npx prisma migrate deploy` | Aplicar migrations pendentes |
| `npx prisma migrate dev --name NOME` | Criar nova migration |
| `npx prisma studio` | Interface visual do banco |

---

## ✅ CHECKLIST DE DEPLOY

Use este checklist toda vez que for fazer deploy:

### Antes do Deploy

- [ ] Código testado localmente
- [ ] Commit feito com mensagem clara
- [ ] Push para repositório remoto
- [ ] Verificar se não há secrets no código

### Durante o Deploy

- [ ] Conectar na VPS
- [ ] `git pull` ou `git reset --hard origin/main`
- [ ] Executar `./switch-to-prod.sh`
- [ ] Aguardar build completar sem erros

### Após o Deploy

- [ ] `docker ps` - todos containers rodando
- [ ] Testar endpoint de health (`/health` ou `/api/health`)
- [ ] Testar login no sistema
- [ ] Testar funcionalidade principal
- [ ] Verificar logs por erros

---

## 📁 ARQUIVOS DE CONFIGURAÇÃO EXEMPLO

### docker-compose.yml (Produção)

```yaml
version: '3.8'

services:
  # ========================
  # BANCO DE DADOS
  # ========================
  db:
    image: mysql:8.0
    container_name: meu-projeto-db
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - app-network

  # ========================
  # BACKEND (API)
  # ========================
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: meu-projeto-api
    restart: unless-stopped
    depends_on:
      - db
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    networks:
      - app-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`api.seudominio.com`)"
      - "traefik.http.routers.api.tls=true"
      - "traefik.http.routers.api.tls.certresolver=letsencrypt"

  # ========================
  # FRONTEND
  # ========================
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: meu-projeto-frontend
    restart: unless-stopped
    depends_on:
      - api
    networks:
      - app-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`app.seudominio.com`)"
      - "traefik.http.routers.frontend.tls=true"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"

  # ========================
  # REVERSE PROXY (SSL/HTTPS)
  # ========================
  traefik:
    image: traefik:v2.10
    container_name: meu-projeto-traefik
    restart: unless-stopped
    command:
      - "--api.dashboard=false"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.email=seu-email@dominio.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik/acme.json:/letsencrypt/acme.json
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  mysql_data:
```

### switch-to-prod.sh

```bash
#!/bin/bash

echo "🚀 Iniciando deploy para PRODUÇÃO..."

# Definir ambiente
sed -i 's/NODE_ENV=.*/NODE_ENV=production/' backend/.env

# Parar containers antigos
echo "⏹️  Parando containers..."
docker compose down

# Buildar e iniciar
echo "🔨 Buildando imagens..."
docker compose up --build --force-recreate -d

# Aguardar containers iniciarem
echo "⏳ Aguardando containers..."
sleep 10

# Aplicar migrations
echo "🗄️  Aplicando migrations..."
docker exec meu-projeto-api npx prisma migrate deploy

# Verificar status
echo "✅ Deploy concluído!"
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### switch-to-dev.sh

```bash
#!/bin/bash

echo "🔧 Iniciando ambiente de DESENVOLVIMENTO..."

# Definir ambiente
sed -i 's/NODE_ENV=.*/NODE_ENV=development/' backend/.env

# Parar containers de produção
docker compose down

# Iniciar desenvolvimento
docker compose -f docker-compose.dev.yml up --build -d

echo "✅ Ambiente de desenvolvimento ativo!"
```

---

## 📞 DICAS FINAIS

### 🎯 Boas Práticas

1. **Sempre faça backup antes de mudanças grandes**
   ```bash
   docker exec CONTAINER_DB mysqldump -u root -p BANCO > backup_$(date +%Y%m%d).sql
   ```

2. **Mantenha logs organizados**
   ```bash
   docker compose logs api > logs_$(date +%Y%m%d).txt
   ```

3. **Use branches para features grandes**
   ```bash
   git checkout -b feature/nova-funcionalidade
   # trabalhe...
   git checkout main
   git merge feature/nova-funcionalidade
   ```

4. **Teste localmente antes de fazer deploy**

5. **Tenha um arquivo .env.example no repositório** (sem valores sensíveis)

### 🚨 Nunca Faça

- ❌ Commitar senhas ou secrets no Git
- ❌ Rodar como root sem necessidade
- ❌ Ignorar erros nos logs
- ❌ Deploy na sexta-feira às 18h 😅

---

## 🆘 PRECISA DE AJUDA?

Se algo der errado:

1. **Verifique os logs:**
   ```bash
   docker compose logs --tail=100
   ```

2. **Reinicie tudo:**
   ```bash
   docker compose down
   docker compose up -d
   ```

3. **Volte para versão anterior:**
   ```bash
   git log --oneline -10  # ver commits
   git checkout HASH_DO_COMMIT_ANTERIOR
   ./switch-to-prod.sh
   ```

4. **Último recurso - rebuild completo:**
   ```bash
   docker compose down -v  # CUIDADO: remove volumes
   docker system prune -a -f
   docker compose up --build -d
   ```

---

> **📝 Este guia foi criado para facilitar deploys. Adapte os valores (IPs, domínios, nomes) conforme sua infraestrutura.**
>
> **Última atualização:** Dezembro 2024


