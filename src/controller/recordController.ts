import type {FastifyInstance} from 'fastify';
import sum from 'lodash/sum';
import {randomUUID} from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import prettyBytes from 'pretty-bytes';
import sharp from 'sharp';
import unzipper from 'unzipper';

import {Day} from '../prisma';
import {generateMealIllustration} from '../prompt/illustration';
import {processMealPhotos} from '../prompt/mealInfo';
import type {MealInfo, MealPhoto, StoredPhoto} from '../types';

// eslint-disable-next-line require-await
async function recordController(fastify: FastifyInstance) {
  const {config, log, prisma, openai} = fastify;

  async function storePhoto({image, dateTaken}: MealPhoto) {
    const filename = `${randomUUID()}.jpg`;
    const dest = path.join(config.DATA_PATH, 'photos', filename.slice(0, 2));
    await fs.mkdir(dest, {recursive: true});
    await fs.writeFile(path.join(dest, filename), image);

    const storedPhoto: StoredPhoto = {
      filename,
      dateTaken,
    };

    log.info(storedPhoto, 'Stored meal photo');
    return storedPhoto;
  }

  async function makeIllustration(prompt: string) {
    const image = await generateMealIllustration(openai, prompt);

    if (image === null) {
      return null;
    }

    const uuid = randomUUID();
    const dest = path.join(config.DATA_PATH, 'illustrations', uuid.slice(0, 2));
    await fs.mkdir(dest, {recursive: true});

    const sharpImage = sharp(await image.bytes());
    await sharpImage.toFile(path.join(dest, `${uuid}.png`));
    await sharpImage.resize(256).toFile(path.join(dest, `${uuid}-sm.png`));

    return uuid;
  }

  async function storeMeal(meal: MealInfo, day: Day, photos: StoredPhoto[]) {
    const {photosIndexes, illustrationPrompt, ...mealData} = meal;
    const mealPhotos = photosIndexes.map(idx => photos[idx]);
    const dateRecorded = new Date(mealPhotos[0].dateTaken);

    const illustration = await makeIllustration(illustrationPrompt);

    const storedMeal = await prisma.meal.upsert({
      where: {dateRecorded},
      create: {
        ...mealData,
        dayId: day.id,
        dateRecorded,
        photos: {createMany: {data: mealPhotos}},
        illustrationPrompt,
        illustration,
      },
      update: {},
    });

    log.info(storedMeal, 'Stored meal');
    return storedMeal;
  }

  async function recordDay(photos: MealPhoto[]) {
    if (photos.length === 0) {
      log.warn('No photos recoreded for today...');
      return;
    }

    const totalSize = sum(photos.map(photo => photo.image.byteLength));
    log.info(`Processing ${photos.length} photos (${prettyBytes(totalSize)})`);

    const datetime = new Date(photos[0].dateTaken);
    datetime.setHours(0, 0, 0, 0);

    const {meals, healthScore, healthSummary} = await processMealPhotos(openai, photos);
    const storedPhotos = await Promise.all(photos.map(storePhoto));

    const day = await prisma.day.upsert({
      where: {datetime},
      create: {
        datetime,
        healthSummary,
        healthScore: healthScore.toString(),
      },
      update: {},
    });

    log.info(day, 'Day created');

    await Promise.all(meals.map(meal => storeMeal(meal, day, storedPhotos)));
  }

  fastify.post('/record', async (request, reply) => {
    if (request.headers.token !== config.RECORD_TOKEN) {
      reply.code(400).send({error: 'Invalid Token provided'});
      return;
    }

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

    const photos: Array<Promise<MealPhoto>> = files.map(async (file, i) => {
      const image = await file.buffer();
      const dateTaken = datesTaken?.[i];

      return {image, dateTaken};
    });

    recordDay(await Promise.all(photos));

    reply.code(200).send({success: true, photosToProcess: photos.length});
  });
}

export default recordController;
