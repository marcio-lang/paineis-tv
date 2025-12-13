# 🚀 Guia de Deploy Automático via GitHub Actions

Este documento descreve como configurar e utilizar o deploy automático do **Sistema de Painéis TV** para a VPS usando GitHub Actions.

---

## 📋 1. Pré-requisitos na VPS

Antes de iniciar, certifique-se de que a VPS está configurada corretamente.

### 1.1. Usuário de Deploy
O deploy utiliza um usuário específico chamado `deploy` para maior segurança.

```bash
# Criar usuário sem senha
sudo adduser --disabled-password --gecos "" deploy
sudo usermod -aG sudo deploy
sudo usermod -aG www-data deploy
```

### 1.2. Configuração SSH
O usuário `deploy` deve ter acesso via chave SSH (sem senha).

1. No seu computador local, gere um par de chaves (se ainda não tiver):
   ```powershell
   ssh-keygen -t ed25519 -C "github-actions-deploy" -f "$env:USERPROFILE\.ssh\id_deploy_github" -N ""
   ```
2. Copie o conteúdo da chave pública (`.pub`) e adicione ao servidor:
   ```bash
   # Na VPS, como usuário deploy:
   mkdir -p ~/.ssh
   chmod 700 ~/.ssh
   echo "SUA_CHAVE_PUBLICA_AQUI" >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   ```

### 1.3. Permissões Sudo Limitadas
Para segurança, o usuário `deploy` só deve ter permissão para reiniciar os serviços necessários sem senha.

Crie o arquivo `/etc/sudoers.d/deploy`:
```bash
deploy ALL=(ALL) NOPASSWD: /bin/systemctl restart paineltv-backend
deploy ALL=(ALL) NOPASSWD: /bin/systemctl reload nginx
deploy ALL=(ALL) NOPASSWD: /usr/bin/rsync
```

### 1.4. Diretórios do Projeto
Certifique-se que os diretórios existem e têm as permissões corretas:

```bash
sudo mkdir -p /var/www/paineis-tv/frontend
sudo mkdir -p /var/www/paineis-tv/BACKEND/uploads
sudo mkdir -p /var/www/paineis-tv/BACKEND/instance
sudo chown -R www-data:www-data /var/www/paineis-tv
sudo chmod -R 755 /var/www/paineis-tv
sudo chmod 777 /var/www/paineis-tv/BACKEND/instance
```

---

## 🔐 2. Configuração do GitHub

No repositório do GitHub, vá em **Settings** → **Secrets and variables**.

### 2.1. Actions Secrets (Segredos)
Adicione em **Secrets** → **Actions** → **New repository secret**:

| Nome | Descrição | Exemplo |
|------|-----------|---------|
| `DEPLOY_HOST` | IP ou domínio da VPS | `212.85.10.184` |
| `DEPLOY_USER` | Usuário criado na VPS | `deploy` |
| `DEPLOY_SSH_KEY` | Conteúdo da chave privada (arquivo sem .pub) | `-----BEGIN OPENSSH...` |
| `DEPLOY_PORT` | (Opcional) Porta SSH se diferente de 22 | `22` |

### 2.2. Actions Variables (Variáveis de Ambiente)
Adicione em **Variables** → **Actions** → **New repository variable**:

| Nome | Descrição | Exemplo |
|------|-----------|---------|
| `FRONTEND_API_URL` | URL da API para o frontend | `http://ofertascaique.cloud/api` |
| `FRONTEND_BACKEND_URL` | URL base do backend | `http://ofertascaique.cloud` |

---

## 🔄 3. Como Realizar o Deploy

### Automático
O deploy é disparado automaticamente a cada **push** na branch `main`.

### Manual
Você pode disparar manualmente em:
1. Aba **Actions** no GitHub.
2. Selecione o workflow **Deploy para VPS**.
3. Clique em **Run workflow**.

### O que o Workflow faz?
1. **Build Frontend**: Compila o React com as variáveis de produção.
2. **Empacotamento**: Prepara os arquivos (excluindo arquivos desnecessários como `node_modules`, `venv`, banco de dados local).
3. **Upload**: Envia os arquivos para a pasta `~/deploy` na VPS via SCP/Rsync.
4. **Deploy**:
   - Sincroniza arquivos para `/var/www/paineis-tv`.
   - Mantém pasta `uploads` e banco de dados intactos.
   - Reinicia o serviço `paineltv-backend`.
   - Recarrega o `nginx`.
   - Verifica saúde da API (`/api/health`).

---

## 🛠️ 4. Solução de Problemas

### Falha no SSH
- Verifique se a chave privada no GitHub Secret está correta (copie todo o conteúdo).
- Verifique se a chave pública está no `~/.ssh/authorized_keys` do usuário `deploy` na VPS.
- Se usar porta diferente de 22, defina o secret `DEPLOY_PORT`.

### Erro de Permissão
- Verifique se o arquivo `/etc/sudoers.d/deploy` está correto.
- Teste na VPS: `sudo -u deploy sudo systemctl restart paineltv-backend`.

### Backend não inicia
- Verifique os logs do serviço:
  ```bash
  sudo journalctl -u paineltv-backend -f
  ```
- Verifique logs do Nginx:
  ```bash
  sudo tail -f /var/log/nginx/error.log
  ```
