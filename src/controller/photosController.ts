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
      const photoPath = path.resolve(config.PHOTOS_PATH, filename.slice(0, 2), filename);

      if (!photoPath.startsWith(config.PHOTOS_PATH)) {
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
}

export default photosController;
