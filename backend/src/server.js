const app = require('./app');
const { env } = require('./config/env');

const server = app.listen(env.port, () => {
  console.log(`Tokenizado API listening on http://localhost:${env.port}`);
  console.log(`Environment: ${env.nodeEnv}`);
  console.log(`CORS origin: ${env.frontendOrigin}`);
});

function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down...`);
  server.close(() => {
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = server;
