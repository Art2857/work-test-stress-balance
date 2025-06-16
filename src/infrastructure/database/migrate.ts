import { Umzug, SequelizeStorage } from 'umzug';
import { QueryInterface } from 'sequelize';
import { sequelize } from './connection';

export interface MigrationFunctions {
  up: (queryInterface: QueryInterface) => Promise<void>;
  down: (queryInterface: QueryInterface) => Promise<void>;
}

const umzug = new Umzug({
  migrations: {
    glob: ['migrations/*.ts', { cwd: __dirname }],
    resolve: ({ name, path: migrationPath }) => {
      const migration: MigrationFunctions = require(migrationPath!);

      if (!migration.up || !migration.down) {
        throw new Error(
          `Migration ${name} must export 'up' and 'down' functions`
        );
      }

      return {
        name,
        up: ({ context }: { context: QueryInterface }) => migration.up(context),
        down: ({ context }: { context: QueryInterface }) =>
          migration.down(context),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({
    sequelize,
    tableName: 'SequelizeMeta',
  }),
  logger: console,
});

export type Migration = typeof umzug._types.migration;

async function executeWithErrorHandling<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  try {
    await sequelize.authenticate();
    return await operation();
  } catch (error) {
    console.error(`${operationName} failed:`, error);
    throw error;
  }
}

export async function runMigrations(): Promise<void> {
  return executeWithErrorHandling(async () => {
    console.log('Running migrations...');
    const migrations = await umzug.up();

    if (migrations.length === 0) {
      console.log('No pending migrations found.');
    } else {
      console.log(`Successfully ran ${migrations.length} migrations:`);
      migrations.forEach(migration => console.log(`  - ${migration.name}`));
    }

    console.log('Migrations completed successfully');
  }, 'Migration');
}

export async function rollbackMigrations(): Promise<void> {
  return executeWithErrorHandling(async () => {
    console.log('Rolling back migrations...');
    const migrations = await umzug.down();
    console.log(`Rolled back ${migrations.length} migrations`);
  }, 'Rollback');
}

export async function getMigrationStatus(): Promise<void> {
  return executeWithErrorHandling(async () => {
    const [executed, pending] = await Promise.all([
      umzug.executed(),
      umzug.pending(),
    ]);

    console.log('Migration Status:');
    console.log(`  Executed: ${executed.length}`);
    executed.forEach(migration => console.log(`    ✓ ${migration.name}`));

    console.log(`  Pending: ${pending.length}`);
    pending.forEach(migration => console.log(`    ○ ${migration.name}`));
  }, 'Status check');
}

if (require.main === module) {
  const command = process.argv[2];
  const operations = {
    up: runMigrations,
    down: rollbackMigrations,
    status: getMigrationStatus,
  } as const;

  const operation = operations[command as keyof typeof operations];

  if (operation) {
    operation()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    console.log('Usage: ts-node migrate.ts [up|down|status]');
    console.log('  up     - Run pending migrations');
    console.log('  down   - Rollback last migration');
    console.log('  status - Show migration status');
    process.exit(1);
  }
}
