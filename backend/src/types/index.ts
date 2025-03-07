export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: AuthUser;
    user: AuthUser;
  }
}

export interface TextCreateInput {
  title: string;
  content: string;
  published?: boolean;
}

export interface TextUpdateInput {
  title?: string;
  content?: string;
  published?: boolean;
}

export interface UserCreateInput {
  email: string;
  name: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
