import { createText, getTexts } from '../../src/controllers/textController';
import { prisma } from '../../src/server';

jest.mock('../../src/server', () => ({
  prisma: {
    text: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

describe('Text Controller', () => {
  let mockRequest: any;
  let mockReply: any;

  beforeEach(() => {
    mockRequest = {
      user: { id: 'user-123' },
      body: { title: 'Test Text', content: 'Test Content' },
      log: { error: jest.fn() },
    };

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createText', () => {
    it('should create a new text', async () => {
      const mockText = {
        id: 'text-123',
        title: 'Test Text',
        content: 'Test Content',
        published: false,
        authorId: 'user-123',
        shareableId: 'share-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.text.create as jest.Mock).mockResolvedValue(mockText);

      await createText(mockRequest, mockReply);

      expect(prisma.text.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Text',
          content: 'Test Content',
          published: false,
          authorId: 'user-123',
        },
      });

      expect(mockReply.status).toHaveBeenCalledWith(201);
      expect(mockReply.send).toHaveBeenCalledWith(mockText);
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await createText(mockRequest, mockReply);

      expect(prisma.text.create).not.toHaveBeenCalled();
      expect(mockReply.status).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });
  });

  describe('getTexts', () => {
    it('should get all texts for the authenticated user', async () => {
      const mockTexts = [
        {
          id: 'text-123',
          title: 'Test Text 1',
          content: 'Test Content 1',
          published: true,
          authorId: 'user-123',
          shareableId: 'share-123',
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { visualizations: 5 },
        },
      ];

      (prisma.text.findMany as jest.Mock).mockResolvedValue(mockTexts);

      await getTexts(mockRequest, mockReply);

      expect(prisma.text.findMany).toHaveBeenCalledWith({
        where: { authorId: 'user-123' },
        include: {
          _count: {
            select: { visualizations: true },
          },
        },
      });

      expect(mockReply.send).toHaveBeenCalledWith(mockTexts);
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await getTexts(mockRequest, mockReply);

      expect(prisma.text.findMany).not.toHaveBeenCalled();
      expect(mockReply.status).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });
  });
});
