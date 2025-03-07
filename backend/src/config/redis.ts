import { FastifyInstance } from "fastify";
import fastifyRedis from "@fastify/redis";

export async function configureRedis(app: FastifyInstance) {
  await app.register(fastifyRedis, {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
    family: 4, // IPv4
  });
}
