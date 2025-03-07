import { buildApp } from './app';
import { PrismaClient } from '@prisma/client';
import './config/tracing';
export const prisma = new PrismaClient();

async function start() {
  try {
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados');

    const app = await buildApp();

    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    const address = await app.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Servidor rodando em: ${address}`);
  } catch (err) {
    console.error('❌ Erro ao iniciar o servidor:', err);
    process.exit(1);
  }
}

start();
