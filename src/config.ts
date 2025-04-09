import env from '@fastify/env';
import {JSONSchemaType} from 'env-schema';
import fp from 'fastify-plugin';

interface EnvConfig {
  PORT: number;
  OPENAI_TOKEN: string;
  PHOTOS_PATH: string;
}

const schema: JSONSchemaType<EnvConfig> = {
  type: 'object',
  required: ['PORT', 'OPENAI_TOKEN', 'PHOTOS_PATH'],
  properties: {
    PORT: {
      type: 'number',
      default: 3006,
    },
    OPENAI_TOKEN: {
      type: 'string',
    },
    PHOTOS_PATH: {
      type: 'string',
    },
  },
} as const;

declare module 'fastify' {
  interface FastifyInstance {
    config: EnvConfig;
  }
}

export const configPlugin = fp(async server => {
  await server.register(env, {confKey: 'config', schema}).after();
});
