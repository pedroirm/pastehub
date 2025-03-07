import { FastifyInstance } from 'fastify';
import rabbitmqService from './rabbitmqService';
import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer;

export async function setupWebSocketService(fastify: FastifyInstance) {
  io = new SocketIOServer(fastify.server, {
    cors: { origin: '*' },
  });

  io.on('connection', socket => {
    console.log('🔌 Novo cliente conectado:', socket.id);

    socket.on('disconnect', () => {
      console.log('❌ Cliente desconectado:', socket.id);
    });
  });

  const setupMessageConsumer = async () => {
    try {
      await rabbitmqService.consumeQueue('text-views', async message => {
        io.emit('text-view-update', {
          textId: message.textId,
          timestamp: message.timestamp,
        });

        console.log('📨 Atualização enviada para os clientes via WebSocket.');
      });
    } catch (error) {
      console.error('❌ Erro no consumo do RabbitMQ:', error);
      setTimeout(setupMessageConsumer, 5000);
    }
  };
  setupMessageConsumer();
}

export function emitTextUpdated(textId: string, updatedText: any) {
  if (io) {
    io.emit('text-updated', { textId, updatedText });
    console.log(`📢 Texto ${textId} atualizado e enviado via WebSocket.`);
  }
}
export function getSocketInstance() {
  return io;
}
