import app from './app';

const port = Number(process.env.MEAL_LOG_PORT) || 3006;

app.listen({port});
console.log(`Meal Log server running on 127.0.0.1:${port}`);
