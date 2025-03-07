# 📌 PasteHub - Backend

Backend da aplicação PasteHub, construído com arquitetura de microserviços para criar, gerenciar e compartilhar textos de forma eficiente e escalável.

## 🚀 Tecnologias Utilizadas

- **Framework**: Fastify (Node.js)
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL
- **Cache**: Redis
- **Mensageria**: RabbitMQ
- **Autenticação**: JWT

## ⚡ Como Rodar

1. Entre na pasta do backend:

   ```bash
   cd backend
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Copie o arquivo .env.example para .env e configure as variáveis:

   ```bash
   cp .env.example .env
   ```

4. Rode as migrações do banco:

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. Inicie o servidor:

   ```bash
   npm run dev
   ```

6. Acesse a API em:
   - http://localhost:3000/

## 🔄 Endpoints Principais

| Endpoint             | Método | Descrição                                  |
| -------------------- | ------ | ------------------------------------------ |
| `/api/auth/register` | POST   | Criar uma nova conta de usuário            |
| `/api/auth/login`    | POST   | Autenticar e receber token JWT             |
| `/api/texts`         | GET    | Listar todos os textos do usuário          |
| `/api/texts`         | POST   | Criar um novo texto                        |
| `/api/texts/:id`     | GET    | Obter um texto específico                  |
| `/api/texts/:id`     | PUT    | Atualizar um texto                         |
| `/api/texts/:id`     | DELETE | Excluir um texto                           |
| `/api/share/:id`     | GET    | Acessar textos compartilhados publicamente |

## 🧪 Rodando Testes

1. Execute os testes unitários:

   ```bash
   npm run test
   ```

2. Execute os testes de integração:
   ```bash
   npm run test:integration
   ```

## 🔍 Ferramentas e Monitoramento

- **Swagger**: http://localhost:4000/api/docs
- **Jaeger** (Observabilidade): http://localhost:16686

## 📁 Estrutura do Projeto

```plaintext
backend/
├── src/
│   ├── config/             # Configurações da aplicação
│   ├── controllers/        # Controladores dos endpoints
│   ├── models/             # Definição de tipos e interfaces
│   ├── routes/             # Rotas da API
│   ├── services/           # Lógica de negócio
│   ├── repositories/       # Acesso ao banco de dados
│   ├── middlewares/        # Middlewares do Fastify
│   ├── utils/              # Utilitários e helpers
│   └── index.ts            # Ponto de entrada da aplicação
├── prisma/                 # ORM Prisma e migrações
├── tests/                  # Testes automatizados
├── .env.example            # Exemplo de variáveis de ambiente
├── package.json            # Dependências e scripts
├── tsconfig.json           # Configuração do TypeScript
└── README.md               # Este documento
```

### Testes de Carga com K6

O projeto utiliza K6 para testes de carga, permitindo simular diversos cenários de tráfego e uso.

#### Executando Testes de Carga

```bash
# Executar teste de carga padrão
k6 run scripts/k6/load-test.js
```
