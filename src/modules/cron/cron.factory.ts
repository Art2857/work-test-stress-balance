import { CronRepository } from './repository/cron.repository';
import { CronService } from './services/cron.service';
import { CronJobExecutor } from './services/cron-job-executor.service';
import { CronController } from './api/cron.controller';

export function createCronModuleWithDependencies() {
  const cronRepository = new CronRepository();
  const cronExecutor = new CronJobExecutor();
  const cronService = new CronService(cronRepository, cronExecutor);
  const cronController = new CronController(cronRepository, cronService);

  return {
    cronController,
    cronRepository,
    cronService,
    cronExecutor,
  };
}
