import { db } from "../database/db";

// CREATE - Ajouter un tour
//segment = chiffre de 0-25
//score = chiffre x multiplier
export const createDart = async ({ turnId, segment, multiplier, score }) => {
    const now = new Date().toISOString();

    return await db.runAsync(
        `
    INSERT INTO darts
    (
     turnId,
    segment,
    multiplier,
    score,
    created_at
    )
    VALUES (?, ?, ?, ?, ?)
    `,
        [turnId, segment, multiplier, score, now],
    );
};

//UPDATE

export const updateDart = async (dartId, segment, multiplier, score) => {
    return await db.runAsync(
        `
    UPDATE darts
    SET segment = ? ,
    multiplier = ? ,
    score = ? ,
    WHERE id = ?
    `,
        [segment, multiplier, score, dartId],
    );
};

export const getDartsByTurnId = async (turnId) => {
    return await db.getAllAsync(
        `
    SELECT *
    FROM darts
    WHERE turnId = ?
    `,
        [turnId],
    );
};
