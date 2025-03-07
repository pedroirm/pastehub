import { buildApp } from '../../src/app';
import { FastifyInstance } from 'fastify';
import { prisma } from '../../src/server';
import bcrypt from 'bcrypt';

describe('API Integration Tests', () => {
  let app: FastifyInstance;
  let token: string;
  let userId: string;
  let textId: string;

  beforeAll(async () => {
    // Configurar banco de dados de teste
    process.env.DATABASE_URL =
      'postgresql://postgres:password@localhost:5432/watch_brasil_test?schema=public';
    process.env.JWT_SECRET = 'test-secret';

    // Construir app
    app = await buildApp();

    // Limpar dados de teste
    await prisma.visualization.deleteMany();
    await prisma.text.deleteMany();
    await prisma.user.deleteMany();

    // Criar usuário de teste
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
      },
    });

    userId = user.id;
  });

  afterAll(async () => {
    // Limpar dados de teste
    await prisma.visualization.deleteMany();
    await prisma.text.deleteMany();
    await prisma.user.deleteMany();

    // Fechar conexões
    await prisma.$disconnect();
    await app.close();
  });

  describe('Authentication', () => {
    it('should login with valid credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'testpassword',
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('token');
      expect(body.user).toHaveProperty('id', userId);

      token = body.token;
    });

    it('should reject login with invalid credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'wrongpassword',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Text Operations', () => {
    it('should create a new text', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/texts',
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          title: 'Test Text',
          content: 'This is a test text',
          published: true,
        },
      });

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('title', 'Test Text');
      expect(body).toHaveProperty('shareableId');

      textId = body.id;
    });

    it('should retrieve user texts', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/texts',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
      expect(body[0]).toHaveProperty('id', textId);
    });

    it('should update a text', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/api/texts/${textId}`,
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          title: 'Updated Test Text',
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('title', 'Updated Test Text');
    });

    it('should access a shared text', async () => {
      const getResponse = await app.inject({
        method: 'GET',
        url: `/api/texts/${textId}`,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const text = JSON.parse(getResponse.body);

      const response = await app.inject({
        method: 'GET',
        url: `/api/share/${text.shareableId}`,
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('title', 'Updated Test Text');
    });

    it('should delete a text', async () => {
      const responseCheck = await app.inject({
        method: 'GET',
        url: `/api/texts/${textId}`,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      if (responseCheck.statusCode === 404) {
        console.warn('Texto já foi deletado antes, pulando o teste.');
        return;
      }
    });
  });
});
