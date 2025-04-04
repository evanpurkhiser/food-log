import multipart from '@fastify/multipart';
import fastify from 'fastify';
import router from './router';

const server = fastify({
  // Logger only for production
  logger: !!(process.env.NODE_ENV !== 'development'),
});

server.register(multipart, {
  limits: {
    fileSize: 1024 * 1024 * 1024 * 20,
  },
});

// Middleware: Router
server.register(router);

export default server;
