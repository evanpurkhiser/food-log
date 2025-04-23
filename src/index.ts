import multipart from '@fastify/multipart';
import {program} from 'commander';
import fastify from 'fastify';

import {configPlugin} from './config';
import {openaiPlugin} from './openai-plugin';
import {prismaPlugin} from './prisma-plugin';
import router from './router';

async function boot() {
  const server = fastify({
    // Logger only for production
    logger: !!(process.env.NODE_ENV !== 'development'),
  });

  await server.register(configPlugin).after();
  await server
    .register(multipart, {
      limits: {
        fileSize: 1024 * 1024 * 1024 * 20,
      },
    })
    .register(prismaPlugin)
    .register(openaiPlugin)
    .after();

  server.register(router);

  program
    .command('server')
    .description('Start the meal-log server')
    .action(async () => {
      await server.listen({host: '0.0.0.0', port: server.config.PORT});
    });

  await program.parseAsync();
}

boot();
