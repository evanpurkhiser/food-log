import env from '@fastify/env';
import {JSONSchemaType} from 'env-schema';
import fp from 'fastify-plugin';

interface EnvConfig {
  PORT: number;
  OPENAI_TOKEN: string;
  /**
   * Path to store photos
   */
  PHOTOS_PATH: string;
  /**
   * Token required to be present on the `/record` upload to accept a
   * logged day of meals
   */
  RECORD_TOKEN: string;
}

const schema: JSONSchemaType<EnvConfig> = {
  type: 'object',
  required: ['PORT', 'OPENAI_TOKEN', 'PHOTOS_PATH', 'RECORD_TOKEN'],
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
    RECORD_TOKEN: {
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
