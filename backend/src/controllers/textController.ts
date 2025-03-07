import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../server';
import { TextCreateInput, TextUpdateInput } from '../types';

import rabbitmqService from '../services/rabbitmqService';
import { emitTextUpdated } from '../services/websocketService';

export async function createText(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { title, content, published = false } = request.body as TextCreateInput;
    const userId = request.user?.id;

    if (!userId) {
      request.log.warn('🚨 Tentativa de criação de texto sem autenticação');
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    request.log.info({ userId, title }, '📝 Criando novo texto');

    const text = await prisma.text.create({
      data: {
        title,
        content,
        published,
        authorId: userId,
      },
    });

    return reply.status(201).send(text);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
}

export async function getTexts(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.user?.id;

    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const texts = await prisma.text.findMany({
      where: { authorId: userId },
      include: {
        _count: {
          select: { visualizations: true },
        },
      },
    });

    return reply.send(texts);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
}

export async function getTextById(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const userId = request.user?.id;

    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const text = await prisma.text.findUnique({
      where: { id },
      include: {
        _count: {
          select: { visualizations: true },
        },
      },
    });

    if (!text) {
      return reply.status(404).send({ error: 'Text not found' });
    }

    if (text.authorId !== userId) {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    return reply.send(text);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
}

export async function updateText(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const { title, content, published } = request.body as TextUpdateInput;
    const userId = request.user?.id;

    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const existingText = await prisma.text.findUnique({
      where: { id },
    });

    if (!existingText) {
      return reply.status(404).send({ error: 'Text not found' });
    }

    if (existingText.authorId !== userId) {
      return reply.status(403).send({ error: 'Forbidden' });
    }
    emitTextUpdated(id, {
      title,
      content,
      published,
      shareableId: existingText.shareableId,
    });
    const updatedText = await prisma.text.update({
      where: { id },
      data: {
        title,
        content,
        published,
      },
    });

    return reply.send(updatedText);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
}

export async function deleteText(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const userId = request.user?.id;

    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    // Verificar se o texto existe e pertence ao usuário
    const existingText = await prisma.text.findUnique({
      where: { id },
    });

    if (!existingText) {
      return reply.status(404).send({ error: 'Text not found' });
    }

    if (existingText.authorId !== userId) {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    await prisma.text.delete({
      where: { id },
    });

    return reply.status(204).send();
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
}
export async function getSharedText(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { shareableId } = request.params as { shareableId: string };
    const clientIp = request.ip || '0.0.0.0';
    const redis = request.server.redis;

    const cachedText = await redis.get(`text:${shareableId}`);
    if (cachedText) {
      await prisma.visualization.create({
        data: {
          textId: JSON.parse(cachedText).id,
          viewerIp: clientIp,
        },
      });

      await rabbitmqService.sendMessage({
        textId: JSON.parse(cachedText).id,
        viewerIp: clientIp,
      });

      return reply.send(JSON.parse(cachedText));
    }

    const text = await prisma.text.findUnique({
      where: { shareableId },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!text || !text.published) {
      return reply.status(404).send({ error: 'Text not found' });
    }

    await prisma.visualization.create({
      data: {
        textId: text.id,
        viewerIp: clientIp,
      },
    });

    try {
      await rabbitmqService.sendMessage({
        textId: text.id,
        viewerIp: clientIp,
      });
    } catch (error) {
      if (error instanceof Error) {
        request.log.error(`❌ Erro ao enviar mensagem para RabbitMQ: ${error.message}`);
      } else {
        request.log.error('❌ Erro ao enviar mensagem para RabbitMQ: Unknown error');
      }
    }

    const responseData = {
      id: text.id,
      title: text.title,
      content: text.content,
      author: text.author.name,
      updatedAt: text.updatedAt,
    };

    await redis.set(`text:${shareableId}`, JSON.stringify(responseData), 'EX', 300);

    return reply.send(responseData);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: (error as any).message });
  }
}
