FROM python:3.9-slim

WORKDIR /app

# Instalar dependências do sistema para Ubuntu
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    make \
    libffi-dev \
    libssl-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar e instalar dependências Python
COPY requirements.txt* ./
RUN pip install --no-cache-dir --upgrade pip && \
    if [ -f requirements.txt ]; then \
        pip install --no-cache-dir -r requirements.txt; \
    else \
        echo "requirements.txt não encontrado, instalando dependências básicas..." && \
        pip install --no-cache-dir Flask==2.3.3 Flask-CORS==4.0.0 Flask-SQLAlchemy==3.0.5 Werkzeug==2.3.7 pytz==2023.3 python-dotenv==1.0.0 Pillow==10.0.0 requests==2.31.0; \
    fi

# Copiar código da aplicação
COPY . .

# Criar script de inicialização
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 5000

# Usar script de entrada que corrige permissões
ENTRYPOINT ["/entrypoint.sh"]
CMD ["python", "app.py"]