import { FastifyInstance } from "fastify";
import { register, login } from "../controllers/authController";

export function authRoutes(fastify: FastifyInstance) {
  fastify.post("/api/auth/register", register);
  fastify.post("/api/auth/login", login);
}
