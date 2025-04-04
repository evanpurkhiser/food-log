import type {FastifyInstance} from 'fastify';
import unzipper from 'unzipper';
import {processPhotos} from '../prompt';
import type {MealPhoto} from '../types';

export default async function indexController(fastify: FastifyInstance) {
  fastify.post('/upload', async (request, reply) => {
    const parts = request.parts();

    let zipFile: Buffer | null = null;
    let datesTaken: Date[] | null = null;

    for await (const part of parts) {
      if (part.type === 'file' && part.fieldname === 'images') {
        zipFile = await part.toBuffer();
      }
      if (part.type === 'field' && part.fieldname === 'datesTaken') {
        const value = part.value as string;
        datesTaken = value.split('\n').map(date => new Date(date));
      }
    }

    if (zipFile === null) {
      reply.code(400).send({error: 'Missing images zip file'});
      return;
    }

    if (datesTaken === null) {
      reply.code(400).send({error: 'Missing datesTaken date list'});
      return;
    }

    const {files} = await unzipper.Open.buffer(zipFile);

    const photos: Promise<MealPhoto>[] = files.map(async (file, i) => {
      const image = await file.buffer();
      const dateTaken = datesTaken?.[i];

      return {image, dateTaken};
    });

    processPhotos(await Promise.all(photos));

    reply.code(200).send({photosToProcess: photos.length});
  });
}
