import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authRoutes } from './authRoutes';
import { textRoutes } from './textRoutes';
// import { setupWebSocketService } from '../services/websocketService';
import { setupAnalyticsRoutes } from '../services/analyticsService';
import audioRoutes from './audioRoutes';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export function configureRoutes(fastify: FastifyInstance) {
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  });

  authRoutes(fastify);
  textRoutes(fastify);
  audioRoutes(fastify);
  setupAnalyticsRoutes(fastify);

  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });
}
