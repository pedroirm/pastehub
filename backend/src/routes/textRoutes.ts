import { FastifyInstance } from 'fastify';
import {
  createText,
  getTexts,
  getTextById,
  updateText,
  deleteText,
  getSharedText,
} from '../controllers/textController';

export function textRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/api/texts',
    {
      preHandler: [fastify.authenticate],
    },
    createText,
  );

  fastify.get(
    '/api/texts',
    {
      preHandler: [fastify.authenticate],
    },
    getTexts,
  );

  fastify.get(
    '/api/texts/:id',
    {
      preHandler: [fastify.authenticate],
    },
    getTextById,
  );

  fastify.put(
    '/api/texts/:id',
    {
      preHandler: [fastify.authenticate],
    },
    updateText,
  );

  fastify.delete(
    '/api/texts/:id',
    {
      preHandler: [fastify.authenticate],
    },
    deleteText,
  );

  // Rota pública para textos compartilhados
  fastify.get('/api/share/:shareableId', getSharedText);
}
