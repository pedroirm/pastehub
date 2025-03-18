import fastify, { FastifyInstance } from 'fastify';
import { fastifyCors } from '@fastify/cors';
import jwt from '@fastify/jwt';

import { configureRoutes } from './routes';
import { configureRedis } from './config/redis';
import { configureSwagger } from './config/swagger';
import { setupWebSocketService } from './services/websocketService';
import { collectDefaultMetrics, register } from 'prom-client';
import fastifyMultipart from '@fastify/multipart';
collectDefaultMetrics();

export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: { colorize: true },
      },
    },
  });

  app.addHook('onRequest', (req, reply, done) => {
    req.log.info(
      {
        method: req.method,
        url: req.url,
        ip: req.ip,
        headers: req.headers,
      },
      '📥 Nova requisição recebida',
    );

    // ⏱️ Marca o tempo de início da requisição
    (req as any).startTime = process.hrtime();
    done();
  });

  app.addHook('onResponse', (req, reply, done) => {
    // ⏱️ Calcula o tempo de resposta
    const startTime = (req as any).startTime;
    const diff = process.hrtime(startTime);
    const responseTimeMs = (diff[0] * 1e3 + diff[1] / 1e6).toFixed(3);

    req.log.info(
      {
        method: req.method,
        url: req.url,
        statusCode: reply.statusCode,
        responseTime: `${responseTimeMs}ms`,
      },
      '📤 Resposta enviada',
    );

    done();
  });

  await app.register(fastifyCors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  await configureRedis(app);
  await configureSwagger(app);
  app.register(fastifyMultipart);
  await setupWebSocketService(app);

  await app.register(jwt, {
    secret: process.env.JWT_SECRET || 'default-secret',
  });

  app.get('/metrics', async (request, reply) => {
    reply.header('Content-Type', register.contentType);
    return reply.send(await register.metrics());
  });

  configureRoutes(app);
  return app;
}
