import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../server';
import { LoginInput, UserCreateInput } from '../types';
import bcrypt from 'bcrypt';

export async function register(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { email, name, password } = request.body as UserCreateInput;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return reply.status(400).send({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    const token = await reply.jwtSign({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return reply.status(201).send({ user, token });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
}

export async function login(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { email, password } = request.body as LoginInput;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const token = await reply.jwtSign({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return reply.send({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
}
