import type {FastifyInstance} from 'fastify';

import unzipper from 'unzipper';
import {processMealPhotos} from '../prompt';
import type {MealPhoto} from '../types';
import sum from 'lodash/sum';
import prettyBytes from 'pretty-bytes';

async function indexController(fastify: FastifyInstance) {
  async function recordDay(photos: MealPhoto[]) {
    if (photos.length === 0) {
      console.warn('No photos recoreded for today...');
      return;
    }

    const totalSize = sum(photos.map(photo => photo.image.byteLength));
    console.info(`Processing ${photos.length} photos (${prettyBytes(totalSize)})`);

    const {meals} = await processMealPhotos(await Promise.all(photos));

    const datetime = new Date(photos[0].dateTaken);
    datetime.setHours(0, 0, 0, 0);

    const day = await fastify.prisma.day.upsert({
      where: {datetime},
      create: {datetime},
      update: {},
    });

    for (const {photosIndexes, ...mealData} of meals) {
      const mealPhotos = photosIndexes.map(idx => photos[idx]);
      const dateRecorded = new Date(mealPhotos[0].dateTaken);

      await fastify.prisma.meal.upsert({
        where: {dateRecorded},
        create: {dayId: day.id, dateRecorded, ...mealData},
        update: {},
      });

      console.info('Logged meal...', mealData);
    }
  }

  fastify.get('/', async (_request, reply) => {
    const totalMeals = await fastify.prisma.meal.count();
    reply.code(200).send({totalMeals});
  });

  fastify.post('/record', async (request, reply) => {
    const parts = request.parts();

    let zipFile: Buffer | null = null;
    let datesTaken: string[] | null = null;

    for await (const part of parts) {
      if (part.type === 'file' && part.fieldname === 'images') {
        zipFile = await part.toBuffer();
      }
      if (part.type === 'field' && part.fieldname === 'datesTaken') {
        const value = part.value as string;
        datesTaken = value.split('\n');
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
