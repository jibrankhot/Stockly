
'use strict';

const app = require('./app');
const { port, nodeEnv } = require('./config/env');

const SHUTDOWN_TIMEOUT_MS = 10000;

const server = app.listen(port, () => {
  console.log('');
  console.log('========================================');
  console.log('          STOCKLY API SERVER');
  console.log('========================================');
  console.log(`Environment : ${nodeEnv}`);
  console.log(`Port        : ${port}`);
  console.log(`API         : http://localhost:${port}`);
  console.log(`Health      : http://localhost:${port}/api/health`);
  console.log('========================================');
  console.log('');
});

server.on('error', (error) => {
  console.error('Stockly API server failed:', error);
  process.exitCode = 1;
});

let isShuttingDown = false;
let shutdownTimer;

const shutdown = (signal) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  console.log(`\n${signal} received. Shutting down Stockly API...`);

  shutdownTimer = setTimeout(() => {
    console.error(
      'Graceful shutdown timed out; closing remaining connections.',
    );

    if (typeof server.closeAllConnections === 'function') {
      server.closeAllConnections();
    }

    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);

  server.close((error) => {
    clearTimeout(shutdownTimer);

    if (error) {
      console.error('Error while stopping Stockly API:', error);
      process.exitCode = 1;
      return;
    }

    console.log('Stockly API server stopped.');
  });

  if (typeof server.closeIdleConnections === 'function') {
    server.closeIdleConnections();
  }
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
