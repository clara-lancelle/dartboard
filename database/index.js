import { configureDatabase } from "./config";
import { runMigrations } from "./migrationRunner";

export const initializeDatabase = async () => {
    await configureDatabase();
    await runMigrations();
};
