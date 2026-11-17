import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`================================================================`);
  console.log(`🚀 ProjuktiX Universal Technology Learning Platform API`);
  console.log(`🌐 Port: ${env.port} | Mode: ${env.nodeEnv}`);
  console.log(`📡 Health endpoint: http://localhost:${env.port}/health`);
  console.log(`📋 Config endpoint: http://localhost:${env.port}/api/v1/config`);
  console.log(`================================================================`);
});

function gracefulShutdown(signal: string) {
  console.log(`\n[ProjuktiX-API] Received ${signal}. Gracefully closing HTTP server...`);
  server.close(() => {
    console.log('[ProjuktiX-API] HTTP server closed cleanly. Exiting process.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('[ProjuktiX-API] Forcefully terminating after timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
