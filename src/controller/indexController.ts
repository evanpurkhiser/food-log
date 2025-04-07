import type {FastifyInstance} from 'fastify';
import unzipper from 'unzipper';
import {processMealPhotos} from '../prompt';
import type {MealPhoto} from '../types';

async function indexController(fastify: FastifyInstance) {
  async function recordDay(photos: MealPhoto[]) {
    if (photos.length === 0) {
      console.warn('No photos recoreded for today...');
      return;
    }

    console.info(`Processing ${photos.length} photos`);

    // TOOD trim down to midnight
    const day = photos[0].dateTaken;

    const meals = await processMealPhotos(await Promise.all(photos));

    console.log(require('util').inspect(meals, {depth: null}));
  }

  fastify.post('/record', async (request, reply) => {
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

    recordDay(await Promise.all(photos));

    reply.code(200).send({photosToProcess: photos.length});
  });
}

export default indexController;
