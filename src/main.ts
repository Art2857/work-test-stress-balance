import { createApplication } from './application';
import { config, getApiUrl } from './config';

async function bootstrap() {
  try {
    const app = await createApplication();

    app.listen(config.server.port, () => {
      console.log(`🚀 Server is running on port ${config.server.port}`);
      console.log(
        `📚 API Documentation: ${getApiUrl()}${config.app.swaggerPath}`
      );
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
