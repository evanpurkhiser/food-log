import type {FastifyInstance} from 'fastify';

import indexController from './controller/indexController';

// eslint-disable-next-line require-await
export default async function router(fastify: FastifyInstance) {
  fastify.register(indexController, {prefix: '/'});
}
