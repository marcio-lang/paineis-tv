# Sistema de Painéis TV — Guia para subir ao GitHub e fazer deploy

Este guia explica como:
- Subir o projeto para o GitHub (via SSH ou HTTPS)
- Configurar Secrets/Variables para o deploy automático
- Disparar e validar o deploy para a VPS

## Requisitos
- Git instalado
- Conta GitHub com acesso ao repositório `marcio-lang/paineis-tv`
- Acesso à VPS (usuário `deploy` com chave SSH configurada)

## Subir o projeto para o GitHub

### Opção A — SSH (recomendado)
1. Gerar chave SSH no Windows:
   ```
   ssh-keygen -t ed25519 -C "github-pessoal" -f "%USERPROFILE%\\.ssh\\id_github" -N ""
   ```
2. Copiar a chave pública e adicionar no GitHub em `Settings → SSH and GPG keys → New SSH key`.
3. Configurar o remoto e enviar:
   ```
   git init
   git branch -M main
   git add .
   git commit -m "chore: projeto e CI de deploy"
   git remote add origin git@github.com:marcio-lang/paineis-tv.git
   git push -u origin main
   ```

### Opção B — HTTPS (alternativa)
1. Criar um token (se necessário) em `Settings → Developer settings → Personal access tokens`.
2. Configurar o remoto e enviar:
   ```
   git init
   git branch -M main
   git add .
   git commit -m "chore: projeto e CI de deploy"
   git remote add origin https://github.com/marcio-lang/paineis-tv.git
   git push -u origin main
   ```

## Configuração do Deploy Automático (GitHub Actions)

### Secrets (Actions)
Crie em `Settings → Secrets and variables → Actions`:
- `DEPLOY_HOST`: IP ou domínio da VPS (ex.: `212.85.10.184`)
- `DEPLOY_USER`: `deploy`
- `DEPLOY_SSH_KEY`: conteúdo da chave privada (arquivo sem `.pub`)
- `DEPLOY_PORT`: `22` (se usar porta diferente do padrão)

### Variables (Actions)
Crie em `Settings → Secrets and variables → Variables`:
- `FRONTEND_API_URL`: `http://ofertascaique.cloud/api`
- `FRONTEND_BACKEND_URL`: `http://ofertascaique.cloud`

## Disparar o Deploy
1. Acesse a aba `Actions` no GitHub.
2. Selecione o workflow `Deploy para VPS`.
3. Clique em `Run workflow` na branch `main`.

## Validar após o deploy
- Frontend: `http://ofertascaique.cloud/`
- API: `http://ofertascaique.cloud/api/health` (retorna `status: ok`)

## Solução de problemas
- Erro de SSH:
  - Verifique `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY` e se a chave pública do `deploy` está em `~/.ssh/authorized_keys` na VPS.
- Permissão negada em sudo:
  - Garanta que exista `/etc/sudoers.d/deploy` permitindo `rsync`, `systemctl restart paineltv-backend` e `systemctl reload nginx`.
- Serviço não inicia:
  ```
  sudo systemctl status paineltv-backend
  sudo tail -f /var/log/nginx/error.log
  ```
