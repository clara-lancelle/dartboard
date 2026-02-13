import { db } from "./db";
import { migrations } from "./migrations";

export const runMigrations = async () => {
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

    const row = await db.getFirstAsync(
        `SELECT value FROM meta WHERE key = 'db_version';`,
    );

    const currentVersion = row ? parseInt(row.value) : 0;

    const pending = migrations.filter((m) => m.version > currentVersion);

    if (pending.length === 0) return;

    await db.withTransactionAsync(async () => {
        for (const migration of pending) {
            await db.execAsync(migration.up);

            await db.runAsync(
                `INSERT OR REPLACE INTO meta (key, value)
         VALUES ('db_version', ?)`,
                [migration.version.toString()],
            );
        }
    });
};
