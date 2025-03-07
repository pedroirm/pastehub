import { FastifyRequest, FastifyReply } from "fastify";
import { login, register } from "../../src/controllers/authController";
import { prisma } from "../../src/server";
import bcrypt from "bcrypt";

// Mock de bcrypt
jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashed-password"),
  compare: jest.fn(),
}));

// Mock do Prisma
jest.mock("../../src/server", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe("Auth Controller", () => {
  let mockRequest: any;
  let mockReply: any;

  beforeEach(() => {
    mockRequest = {
      body: {
        email: "test@example.com",
        name: "Test User",
        password: "password123",
      },
      log: { error: jest.fn() },
    };

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      jwtSign: jest.fn().mockResolvedValue("mock-token"),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      await register(mockRequest, mockReply);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });

      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: "test@example.com",
          name: "Test User",
          password: "hashed-password",
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });

      expect(mockReply.jwtSign).toHaveBeenCalledWith({
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
      });

      expect(mockReply.status).toHaveBeenCalledWith(201);
      expect(mockReply.send).toHaveBeenCalledWith({
        user: mockUser,
        token: "mock-token",
      });
    });

    it("should return 400 if email is already registered", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "existing-user",
        email: "test@example.com",
      });

      await register(mockRequest, mockReply);

      expect(prisma.user.create).not.toHaveBeenCalled();
      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Email already registered",
      });
    });
  });

  describe("login", () => {
    it("should login a user with valid credentials", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        password: "hashed-password",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await login(mockRequest, mockReply);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hashed-password"
      );

      expect(mockReply.jwtSign).toHaveBeenCalledWith({
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
      });

      expect(mockReply.send).toHaveBeenCalledWith({
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
        token: "mock-token",
      });
    });

    it("should return 401 for invalid credentials", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        password: "hashed-password",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await login(mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Invalid credentials",
      });
    });

    it("should return 401 if user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await login(mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Invalid credentials",
      });
    });
  });
});
