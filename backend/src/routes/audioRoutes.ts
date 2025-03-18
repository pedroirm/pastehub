import { FastifyInstance } from 'fastify';
import {
  uploadAudio,
  getAudioById,
  streamAudio,
  deleteAudio,
} from '../controllers/audioController';

export default async function audioRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/api/audio/upload',
    {
      preHandler: [fastify.authenticate],
    },
    uploadAudio,
  );
  fastify.get('/audio/:id', getAudioById);
  fastify.get('/audio/stream/:id', streamAudio);
  fastify.delete('/audio/:id', deleteAudio);
}
