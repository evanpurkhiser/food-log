import env from '@fastify/env';
import {JSONSchemaType} from 'env-schema';
import fp from 'fastify-plugin';

interface EnvConfig {
  PORT: number;
  OPENAI_TOKEN: string;
  /**
   * Location where photos and illustrations will be stored
   */
  DATA_PATH: string;
  /**
   * Token required to be present on the `/record` upload to accept a
   * logged day of meals
   */
  RECORD_TOKEN: string;
}

const schema: JSONSchemaType<EnvConfig> = {
  type: 'object',
  required: ['PORT', 'OPENAI_TOKEN', 'DATA_PATH', 'RECORD_TOKEN'],
  properties: {
    PORT: {
      type: 'number',
      default: 3006,
    },
    OPENAI_TOKEN: {
      type: 'string',
    },
    DATA_PATH: {
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
