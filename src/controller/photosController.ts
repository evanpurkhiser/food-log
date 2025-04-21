import type {FastifyInstance, FastifyRequest} from 'fastify';
import fsSync from 'node:fs';
import path from 'node:path';

// eslint-disable-next-line require-await
async function photosController(fastify: FastifyInstance) {
  const {config} = fastify;

  fastify.get(
    '/photo/:filename',
    async (request: FastifyRequest<{Params: {filename: string}}>, reply) => {
      const {filename} = request.params;
      const photosDir = path.join(config.DATA_PATH, 'photos');
      const photoPath = path.resolve(photosDir, filename.slice(0, 2), filename);

      if (!photoPath.startsWith(photosDir)) {
        return reply.status(404).send();
      }

      if (!fsSync.existsSync(photoPath)) {
        return reply.status(404).send();
      }

      return reply
        .status(200)
        .type('image/jpeg')
        .send(fsSync.createReadStream(photoPath));
    }
  );

  fastify.get(
    '/illustration/:filename',
    async (request: FastifyRequest<{Params: {filename: string}}>, reply) => {
      const {filename} = request.params;
      const illustrationsDir = path.join(config.DATA_PATH, 'illustrations');
      const illustrationPath = path.resolve(
        illustrationsDir,
        filename.slice(0, 2),
        filename
      );

      if (!illustrationPath.startsWith(illustrationsDir)) {
        return reply.status(404).send();
      }

      if (!fsSync.existsSync(illustrationPath)) {
        return reply.status(404).send();
      }

      return reply
        .status(200)
        .type('image/jpeg')
        .send(fsSync.createReadStream(illustrationPath));
    }
  );
}

export default photosController;
