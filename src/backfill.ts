import {FastifyInstance} from 'fastify';
import {randomUUID} from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

import {generateMealIllustration} from './prompt/illustration';
import {processMealPhotos} from './prompt/mealInfo';

export async function backfill(fastify: FastifyInstance) {
  const {config, log, openai, prisma} = fastify;

  const days = await prisma.day.findMany({
    take: 1,
    include: {meals: {include: {photos: true}}},
    where: {
      OR: [{healthScore: ''}, {meals: {some: {illustration: null}}}],
    },
  });

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

  for (const day of days) {
    const {id} = day;

    const photoPromises = day.meals
      .flatMap(m => m.photos)
      .map(async photo => {
        const filePath = path.join(
          config.DATA_PATH,
          'photos',
          photo.filename.slice(0, 2),
          photo.filename
        );

        return {
          image: await fs.readFile(filePath),
          dateTaken: photo.dateTaken.toISOString(),
        };
      });

    const mealsInOrder = day.meals.toSorted(
      (a, b) => a.dateRecorded.valueOf() - b.dateRecorded.valueOf()
    );

    const photos = await Promise.all(photoPromises);
    const {meals, healthScore, healthSummary} = await processMealPhotos(openai, photos);

    log.info({dt: day.datetime, healthSummary, healthScore}, 'Updating day...');

    if (meals.length !== day.meals.length) {
      log.warn('Skipping meal day, meal count mismatch');
      continue;
    }

    prisma.day.update({
      where: {id},
      data: {healthScore: healthScore.toString(), healthSummary},
    });

    for (const [idx, meal] of meals.entries()) {
      const {illustrationPrompt, foodType, cusineType, foodGroups} = meal;
      const mealDb = mealsInOrder[idx];
      log.info({old: mealDb.name, new: meal.name}, 'generating illustration for...');

      if (mealDb.category !== meal.category) {
      }

      const illustration = await makeIllustration(meal.illustrationPrompt);

      prisma.meal.update({
        where: {id: mealDb.id},
        data: {illustrationPrompt, illustration},
      });
    }
  }
}
