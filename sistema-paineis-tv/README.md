# Sistema de Painéis TV

Sistema completo de gerenciamento de painéis para TV com interface moderna e funcionalidades avançadas.

## 🚀 Características

- **Interface Moderna**: Design responsivo com Tailwind CSS e animações fluidas
- **Autenticação Completa**: Sistema JWT com proteção de rotas
- **Gerenciamento de Usuários**: CRUD completo com controle de permissões
- **Painéis Dinâmicos**: Criação e gerenciamento de painéis com diferentes layouts
- **Sistema de Ações**: Associação de ações aos painéis com upload de imagens
- **Módulo Açougue**: Sistema especializado para açougues com TV player
- **Performance Otimizada**: Lazy loading, code splitting e build otimizado

## 🛠️ Tecnologias

### Frontend
- **React 19** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para estilização
- **React Router** para navegação
- **Zustand** para gerenciamento de estado
- **Lucide React** para ícones

### Backend
- **Flask** (Python)
- **SQLAlchemy** para ORM
- **JWT** para autenticação
- **SQLite** como banco de dados
- **Werkzeug** para segurança

## 📋 Pré-requisitos

- Node.js 20.15.0 ou superior
- Python 3.8 ou superior
- npm ou pnpm

## 🚀 Instalação e Configuração

### 1. Clone o Repositório

```bash
git clone <url-do-repositorio>
cd sistema-paineis-tv
```

### 2. Configuração do Frontend

```bash
# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env.local

# Configurar variáveis de ambiente
# Edite o arquivo .env.local com suas configurações
```

### 3. Configuração do Backend

```bash
# Navegar para o diretório do backend
cd ../BACKEND

# Criar ambiente virtual (recomendado)
python -m venv venv

# Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Inicializar banco de dados
python init_db.py
```

## 🏃‍♂️ Executando o Sistema

### Desenvolvimento

1. **Iniciar o Backend**:
```bash
cd BACKEND
python app.py
```
O backend estará disponível em `http://localhost:5000`

2. **Iniciar o Frontend**:
```bash
cd sistema-paineis-tv
npm run dev
```
O frontend estará disponível em `http://localhost:3000`

### Produção

1. **Build do Frontend**:
```bash
npm run build:prod
```

2. **Testar Build**:
```bash
npm run preview
```

## 🔐 Credenciais Padrão

- **Email**: admin@paineltv.com
- **Senha**: admin123

## 📁 Estrutura do Projeto

```
sistema-paineis-tv/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── base/           # Componentes base (Button, Input, etc.)
│   │   ├── layout/         # Componentes de layout
│   │   └── ui/             # Componentes de interface
│   ├── contexts/           # Contextos React
│   ├── pages/              # Páginas da aplicação
│   │   ├── auth/           # Páginas de autenticação
│   │   ├── paineis/        # Gerenciamento de painéis
│   │   ├── acoes/          # Gerenciamento de ações
│   │   ├── usuarios/       # Gerenciamento de usuários
│   │   └── butcher/        # Módulo açougue
│   ├── services/           # Serviços de API
│   ├── router/             # Configuração de rotas
│   ├── types/              # Definições TypeScript
│   └── utils/              # Utilitários
├── tests/                  # Testes do sistema
├── public/                 # Arquivos públicos
└── dist/                   # Build de produção
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento
npm run build            # Build para produção
npm run build:prod       # Build otimizado para produção
npm run preview          # Visualizar build de produção
npm run check            # Verificação TypeScript
npm run lint             # Linting do código
npm run test             # Executar testes
```

## 🌐 Variáveis de Ambiente

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000/api
VITE_BACKEND_URL=http://localhost:5000
```

### Produção (.env.production)
```env
NODE_ENV=production
VITE_API_URL=https://seu-dominio.com/api
VITE_BACKEND_URL=https://seu-dominio.com
VITE_BUILD_MODE=production
VITE_ENABLE_SOURCEMAP=false
```

## 📊 Funcionalidades

### 🔐 Autenticação
- Login/Logout com JWT
- Proteção de rotas
- Gerenciamento de sessão
- Recuperação de senha

### 👥 Gerenciamento de Usuários
- CRUD completo de usuários
- Controle de permissões (admin/user)
- Ativação/desativação de contas
- Busca e filtros

### 📺 Painéis
- Criação de painéis com diferentes layouts
- Upload de imagens
- Associação com ações
- Visualização em tempo real

### ⚡ Ações
- CRUD de ações
- Upload de imagens
- Associação com múltiplos painéis
- Filtros avançados

### 🥩 Módulo Açougue
- Gerenciamento de produtos
- Configuração de preços
- TV player para exibição
- Background customizável

## 🧪 Testes

### Testes Automatizados
```bash
npm run test
```

### Testes Manuais
Execute o script de testes do sistema:
```bash
node tests/system-tests.js
```

## 📱 Responsividade

O sistema é totalmente responsivo e otimizado para:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

## 🚀 Deploy

### Preparação
1. Configure as variáveis de ambiente de produção
2. Execute o build otimizado
3. Teste o build localmente

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Servidor Próprio
1. Execute `npm run build:prod`
2. Copie a pasta `dist/` para seu servidor
3. Configure servidor web (Nginx/Apache)
4. Configure SSL/HTTPS

## 🔧 Configuração do Servidor Web

### Nginx
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de CORS**:
   - Verifique as configurações do backend
   - Configure CORS adequadamente

2. **Falha na Autenticação**:
   - Verifique se o backend está rodando
   - Confirme as credenciais padrão

3. **Erro de Build**:
   - Execute `npm run check` para verificar TypeScript
   - Verifique se todas as dependências estão instaladas

4. **Performance Lenta**:
   - Use o build de produção (`npm run build:prod`)
   - Verifique se o lazy loading está funcionando

## 📞 Suporte

Para suporte técnico ou dúvidas:
- Abra uma issue no repositório
- Consulte a documentação técnica
- Verifique os logs do sistema

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📈 Roadmap

- [ ] Implementação de testes unitários
- [ ] Sistema de notificações em tempo real
- [ ] API REST documentada com Swagger
- [ ] Dashboard de analytics
- [ ] Suporte a múltiplos idiomas
- [ ] Sistema de backup automático

---

**Desenvolvido com ❤️ para gerenciamento eficiente de painéis TV**