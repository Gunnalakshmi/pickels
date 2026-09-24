import { createApp } from './app';
import { config } from './config/env';
import { db } from './database/db';
import { seedDatabase } from './database/seed';

async function bootstrap() {
  try {
    console.log('🌶️ Initializing PickleMart India Backend Server...');
    await db.initialize();
    await seedDatabase();

    const app = createApp();
    const server = app.listen(config.port, () => {
      console.log(`====================================================`);
      console.log(`🥒 PickleMart India REST API running on port ${config.port}`);
      console.log(`🚀 Mode: ${config.nodeEnv} | Payment Mode: ${config.paymentMode}`);
      console.log(`📜 FSSAI License: ${config.store.fssaiNumber}`);
      console.log(`⚡ API URL: http://localhost:${config.port}/api`);
      console.log(`====================================================`);
    });

    // Graceful shutdown
    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
    signals.forEach(sig => {
      process.on(sig, () => {
        console.log(`Received ${sig}, closing server...`);
        server.close(() => {
          console.log('Server closed successfully.');
          process.exit(0);
        });
      });
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  bootstrap();
}
