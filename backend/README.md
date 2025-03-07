# Watch Brasil - Sistema de Compartilhamento de Textos

## Descrição

Este projeto é um sistema de compartilhamento de textos onde usuários podem criar, editar e compartilhar textos com outras pessoas. O sistema inclui autenticação, atualizações em tempo real e monitoramento de visualizações.

## Funcionalidades Principais

- ✅ Autenticação de usuários (registro/login)
- ✅ CRUD completo de textos
- ✅ Compartilhamento via links únicos
- ✅ Atualizações em tempo real via WebSockets
- ✅ Monitoramento de visualizações
- ✅ Observabilidade com OpenTelemetry
- ✅ Mensageria com Kafka
- ✅ Cache com Redis

## Tecnologias Utilizadas

### Backend

- Node.js com TypeScript
- Fastify como framework web
- Prisma como ORM
- PostgreSQL como banco de dados relacional
- Redis para cache
- Kafka para mensageria
- JWT para autenticação
- Jest para testes
- K6 para testes de carga
- OpenTelemetry para observabilidade

## Requisitos

- Node.js 18+
- Docker e Docker Compose
- PostgreSQL
- Redis
- Kafka (opcional para execução local)

## Instalação e Execução

### Com Docker (Recomendado)

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/watch-brasil.git
   cd watch-brasil/backend
   ```
