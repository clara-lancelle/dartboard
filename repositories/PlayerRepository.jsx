import { db } from "../database/db";

//
// CREATE
//
export const createPlayer = async ({ name, avatar }) => {
    const createdAt = new Date().toISOString();
    const result = await db.runAsync(
        `
    INSERT INTO players (name, avatar, created_at)
    VALUES (?, ?, ?)
    `,
        [name, avatar, createdAt],
    );

    return result.lastInsertRowId;
};

//
// READ - Tous les joueurs non supprimés
//
export const getPlayers = async () => {
    return await db.getAllAsync(
        `
    SELECT id, name, avatar, strftime('%d-%m-%Y', created_at) AS created_at_formatted  FROM players
    WHERE deleted_at IS NULL
    ORDER BY created_at DESC
    `,
    );
};

//
// READ - Un joueur
//
export const getPlayerById = async (id) => {
    return await db.getFirstAsync(
        `
    SELECT * FROM players
    WHERE id = ?
    `,
        [id],
    );
};

//
// UPDATE
//
export const updatePlayer = async (id, { name, avatar }) => {
    await db.runAsync(
        `
    UPDATE players
    SET name = ?, avatar = ?
    WHERE id = ?
    `,
        [name, avatar, id],
    );
};

//
// SOFT DELETE
//
export const deletePlayer = async (id) => {
    const deletedAt = new Date().toISOString();
    console.log("cc", id, deletedAt);
    await db.runAsync(
        `
    UPDATE players
    SET deleted_at = ?
    WHERE id = ?
    `,
        [deletedAt, id],
    );
};
