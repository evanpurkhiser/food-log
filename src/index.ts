import app from './app';

const port = Number(process.env.MEAL_LOG_PORT) || 3006;

app.listen({host: '0.0.0.0', port});
