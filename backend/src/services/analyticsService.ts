import { PrismaClient } from '@prisma/client';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

const prisma = new PrismaClient();

export async function getTextVisualizationsCount(textId: string): Promise<number> {
  const count = await prisma.visualization.count({
    where: { textId },
  });

  return count;
}

export async function getTextVisualizationsByPeriod(
  textId: string,
  startDate: Date,
  endDate: Date,
) {
  const visualizations = await prisma.visualization.findMany({
    where: {
      textId,
      viewedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      viewedAt: 'asc',
    },
  });

  return visualizations;
}

export async function setupAnalyticsRoutes(fastify: FastifyInstance) {
  // Definimos o tipo explícito para request
  interface AnalyticsParams {
    id: string;
  }

  fastify.get<{ Params: AnalyticsParams }>(
    '/api/analytics/text/:id',
    {
      preHandler: [
        (request: FastifyRequest, reply: FastifyReply) => {
          // Use o hook de autenticação decorado no Fastify
          return fastify.authenticate(request, reply);
        },
      ],
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        // Tipo seguro para o usuário após autenticação
        const userId =
          request.user && typeof request.user === 'object' && 'id' in request.user
            ? (request.user.id as string)
            : null;

        if (!userId) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        // Verificar se o texto pertence ao usuário
        const text = await prisma.text.findUnique({
          where: { id },
        });

        if (!text || text.authorId !== userId) {
          return reply.status(403).send({ error: 'Forbidden' });
        }

        // Obter contagem total de visualizações
        const totalViews = await getTextVisualizationsCount(id);

        // Obter visualizações dos últimos 30 dias
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const recentViews = await getTextVisualizationsByPeriod(id, startDate, endDate);

        // Agrupar por dia com tipos explícitos
        const viewsByDay = recentViews.reduce(
          (acc: Record<string, number>, view: { viewedAt: { toISOString: () => string } }) => {
            const date = view.viewedAt.toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
          },
          {},
        );

        return reply.send({
          totalViews,
          viewsByDay,
        });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    },
  );
}
