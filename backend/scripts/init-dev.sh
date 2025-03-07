#!/bin/bash

echo "🚀 Inicializando ambiente de desenvolvimento..."

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

# Verificar se o Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

# Iniciar serviços do Docker
echo "📦 Iniciando containers..."
docker-compose up -d

# Aguardar os serviços iniciarem
echo "⏳ Aguardando serviços iniciarem..."
sleep 10

# Executar migrações do Prisma
echo "🗄️ Executando migrações do banco de dados..."
npx prisma migrate dev

# Iniciar servidor em modo de desenvolvimento
echo "🌐 Iniciando servidor em modo de desenvolvimento..."
npm run dev