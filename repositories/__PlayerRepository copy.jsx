import { getDb } from "../database/db";
import { Player } from "../models/Player";

export const PlayerRepository = {
    async init() {
        const db = await getDb();
        db.transaction((tx) => {
            tx.executeSql(`
                CREATE TABLE IF NOT EXISTS players (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    avatar TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
            `);
        });
    },

    async getAll() {
        const db = await getDb();
        return new Promise((resolve, reject) => {
            db.transaction((tx) => {
                tx.executeSql(
                    "SELECT * FROM players ORDER BY created_at DESC;",
                    [],
                    (_, { rows }) => {
                        const players = rows._array.map(
                            (row) =>
                                new Player({
                                    id: row.id,
                                    name: row.name,
                                    avatar: row.avatar,
                                    createdAt: new Date(row.created_at),
                                }),
                        );
                        resolve(players);
                    },
                    (_, error) => {
                        console.error("SQL select Error:", error);
                        reject(error);
                        return true;
                    },
                );
            });
        });
    },

    async create(name, avatar) {
        const db = await getDb();
        const createdAt = new Date().toISOString();
        return new Promise((resolve, reject) => {
            db.transaction((tx) => {
                tx.executeSql(
                    "INSERT INTO players (name, avatar, created_at) VALUES (?, ?, ?);",
                    [name, avatar, createdAt],
                    (_, result) =>
                        resolve(
                            new Player({
                                id: result.insertId,
                                name,
                                avatar,
                                createdAt,
                            }),
                        ),
                    (_, error) => {
                        console.error("SQL insert Error:", error);
                        reject(error);
                        return true;
                    },
                );
            });
        });
    },

    async update(id, name) {
        const db = await getDb();
        return new Promise((resolve, reject) => {
            db.transaction((tx) => {
                tx.executeSql(
                    "UPDATE players SET name = ? WHERE id = ?;",
                    [name, id],
                    () => resolve(),
                    (_, error) => {
                        console.error("SQL update Error:", error);
                        reject(error);
                        return true;
                    },
                );
            });
        });
    },

    async delete(id) {
        const db = await getDb();
        return new Promise((resolve, reject) => {
            db.transaction((tx) => {
                tx.executeSql(
                    "DELETE FROM players WHERE id = ?;",
                    [id],
                    () => resolve(),
                    (_, error) => {
                        console.error("SQL delete Error:", error);
                        reject(error);
                        return true;
                    },
                );
            });
        });
    },
};
