import { CronJob } from '../domain/cron-job.entity';

export interface JobFunction {
  (executionId: number): Promise<string>;
}

export class CronJobExecutor {
  private jobFunctions: Map<string, JobFunction> = new Map();

  constructor() {
    this.registerJobFunctions();
  }

  private registerJobFunctions(): void {
    this.jobFunctions.set('dataCleanupJob', this.dataCleanupJob.bind(this));
    this.jobFunctions.set(
      'reportGenerationJob',
      this.reportGenerationJob.bind(this)
    );
    this.jobFunctions.set('backupJob', this.backupJob.bind(this));
    this.jobFunctions.set('notificationJob', this.notificationJob.bind(this));
    this.jobFunctions.set('analyticsJob', this.analyticsJob.bind(this));
  }

  async executeJob(job: CronJob, executionId: number): Promise<string> {
    const jobFunction = this.jobFunctions.get(job.functionName);

    if (!jobFunction) {
      throw new Error(`Job function '${job.functionName}' not found`);
    }

    const startTime = Date.now();
    console.log(
      `📋 Executing job '${job.name}' (${job.functionName}) - Execution ID: ${executionId}`
    );

    const result = await jobFunction(executionId);

    const duration = Date.now() - startTime;
    console.log(`⏱️ Job '${job.name}' execution completed in ${duration}ms`);

    return result;
  }

  private async dataCleanupJob(executionId: number): Promise<string> {
    const steps = [
      'Сканирование устаревших записей',
      'Анализ зависимостей данных',
      'Архивирование важных данных',
      'Удаление временных файлов',
      'Очистка кэша приложения',
      'Оптимизация базы данных',
      'Генерация отчета по очистке',
    ];

    let processedItems = 0;
    const totalItems = 1247;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      console.log(`[${executionId}] Шаг ${i + 1}/${steps.length}: ${step}`);

      const stepDuration = 18000 + Math.random() * 12000;
      const stepItems = Math.floor(totalItems / steps.length);

      await this.simulateProgressiveWork(
        stepDuration,
        stepItems,
        (progress, items) => {
          processedItems += items;
          if (Math.random() < 0.1) {
            console.log(
              `[${executionId}] ${step}: ${progress}% (обработано ${processedItems}/${totalItems} элементов)`
            );
          }
        }
      );
    }

    return `Очистка данных завершена. Обработано ${processedItems} элементов, освобождено ${Math.floor(Math.random() * 500 + 100)}MB дискового пространства`;
  }

  private async reportGenerationJob(executionId: number): Promise<string> {
    const reports = [
      'Отчет по производительности системы',
      'Статистика пользовательской активности',
      'Анализ финансовых транзакций',
      'Отчет по безопасности и доступу',
      'Сводка системных ошибок',
      'Отчет по использованию ресурсов',
    ];

    const generatedReports = [];

    for (let i = 0; i < reports.length; i++) {
      const reportName = reports[i];
      console.log(
        `[${executionId}] Генерация отчета ${i + 1}/${reports.length}: ${reportName}`
      );

      const steps = [
        'Сбор данных',
        'Анализ',
        'Форматирование',
        'Проверка качества',
      ];
      for (const step of steps) {
        console.log(`[${executionId}] ${reportName} - ${step}`);
        await this.sleep(8000 + Math.random() * 7000);
      }

      const reportSize = Math.floor(Math.random() * 5000 + 1000);
      generatedReports.push(`${reportName} (${reportSize}KB)`);
    }

    return `Генерация отчетов завершена. Создано отчетов: ${generatedReports.length}. Детали: ${generatedReports.join(', ')}`;
  }

  private async backupJob(executionId: number): Promise<string> {
    const backupTasks = [
      { name: 'База данных пользователей', size: 2500 },
      { name: 'Конфигурационные файлы', size: 150 },
      { name: 'Логи приложения', size: 800 },
      { name: 'Медиа файлы', size: 15000 },
      { name: 'Документы системы', size: 600 },
    ];

    let totalBackedUp = 0;
    const backupResults = [];

    for (const task of backupTasks) {
      console.log(`[${executionId}] Создание резервной копии: ${task.name}`);

      await this.simulateProgressiveWork(
        25000 + Math.random() * 15000,
        task.size,
        progress => {
          if (progress % 20 === 0) {
            console.log(
              `[${executionId}] ${task.name}: ${progress}% (${Math.floor((task.size * progress) / 100)}MB)`
            );
          }
        }
      );

      totalBackedUp += task.size;
      backupResults.push(`${task.name}: ${task.size}MB`);

      await this.sleep(2000);
    }

    return `Резервное копирование завершено. Всего скопировано: ${totalBackedUp}MB. Детали: ${backupResults.join(', ')}`;
  }

  private async notificationJob(executionId: number): Promise<string> {
    const notificationTypes = [
      { type: 'Email уведомления', count: 1250 },
      { type: 'SMS рассылка', count: 340 },
      { type: 'Push уведомления', count: 2100 },
      { type: 'Внутрисистемные уведомления', count: 890 },
      { type: 'Webhook вызовы', count: 150 },
    ];

    let totalSent = 0;
    const results = [];

    for (const notification of notificationTypes) {
      console.log(`[${executionId}] Отправка ${notification.type}`);

      const batchSize = 50;
      const batches = Math.ceil(notification.count / batchSize);

      for (let batch = 0; batch < batches; batch++) {
        const currentBatchSize = Math.min(
          batchSize,
          notification.count - batch * batchSize
        );
        await this.sleep(3000 + Math.random() * 2000);

        totalSent += currentBatchSize;

        if (batch % 5 === 0) {
          const progress = Math.floor(((batch + 1) / batches) * 100);
          console.log(
            `[${executionId}] ${notification.type}: ${progress}% (${batch * batchSize + currentBatchSize}/${notification.count})`
          );
        }
      }

      results.push(`${notification.type}: ${notification.count} отправлено`);
    }

    return `Отправка уведомлений завершена. Всего отправлено: ${totalSent}. Детали: ${results.join(', ')}`;
  }

  private async analyticsJob(executionId: number): Promise<string> {
    const analyticsSteps = [
      'Сбор данных из источников',
      'Очистка и нормализация данных',
      'Применение алгоритмов анализа',
      'Расчет ключевых метрик',
      'Построение предиктивных моделей',
      'Генерация инсайтов',
      'Сохранение результатов анализа',
    ];

    let processedRecords = 0;
    const totalRecords = 45000;
    const insights = [];

    for (let i = 0; i < analyticsSteps.length; i++) {
      const step = analyticsSteps[i];
      console.log(
        `[${executionId}] Аналитический этап ${i + 1}/${analyticsSteps.length}: ${step}`
      );

      const stepRecords = Math.floor(totalRecords / analyticsSteps.length);
      const stepDuration = 20000 + Math.random() * 10000;

      await this.simulateProgressiveWork(
        stepDuration,
        stepRecords,
        (progress, records) => {
          processedRecords += records;

          if (progress % 25 === 0) {
            console.log(
              `[${executionId}] ${step}: ${progress}% (${processedRecords}/${totalRecords} записей)`
            );
          }
        }
      );

      if (i >= 3) {
        const insight = this.generateRandomInsight();
        insights.push(insight);
        console.log(`[${executionId}] Найден инсайт: ${insight}`);
      }
    }

    return `Аналитическая обработка завершена. Обработано ${processedRecords} записей, найдено ${insights.length} инсайтов: ${insights.join('; ')}`;
  }

  private generateRandomInsight(): string {
    const insights = [
      'Активность пользователей увеличилась на 15% по сравнению с прошлой неделей',
      'Пиковая нагрузка приходится на 14:00-16:00',
      'Наиболее популярная функция: управление балансом (78% использования)',
      'Средняя длительность сессии составляет 12 минут',
      'Обнаружена корреляция между временем запроса и успешностью транзакции',
      'География пользователей: 45% Россия, 20% СНГ, 35% другие страны',
    ];

    return insights[Math.floor(Math.random() * insights.length)];
  }

  private async simulateProgressiveWork(
    durationMs: number,
    totalItems: number,
    progressCallback?: (progress: number, itemsDelta: number) => void
  ): Promise<void> {
    const steps = 20;
    const stepDuration = durationMs / steps;
    const itemsPerStep = Math.floor(totalItems / steps);

    for (let i = 0; i < steps; i++) {
      await this.sleep(stepDuration);
      const progress = Math.floor(((i + 1) / steps) * 100);

      if (progressCallback) {
        progressCallback(progress, itemsPerStep);
      }
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  registerJobFunction(name: string, func: JobFunction): void {
    this.jobFunctions.set(name, func);
  }

  getAvailableFunctions(): string[] {
    return Array.from(this.jobFunctions.keys());
  }
}
