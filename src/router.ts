import type {FastifyInstance} from 'fastify';

import indexController from './controller/indexController';
import photosController from './controller/photosController';
import recordController from './controller/recordController';

// eslint-disable-next-line require-await
export default async function router(fastify: FastifyInstance) {
  fastify.register(indexController);
  fastify.register(photosController);
  fastify.register(recordController);
}
