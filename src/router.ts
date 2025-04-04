import type {FastifyInstance} from 'fastify';
import indexController from './controller/indexController';

export default async function router(fastify: FastifyInstance) {
  fastify.register(indexController, {prefix: '/'});
}
