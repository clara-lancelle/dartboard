import { db } from "../database/db";

/*CREATE TABLE IF NOT EXISTS sets (
    id INTEGER PRIMARY KEY NOT NULL,
    gameId INTEGER NOT NULL,
    isOver INTEGER NOT NULL DEFAULT 0,
    winnerId INTEGER,
    created_at TEXT NOT NULL,
    FOREIGN KEY (gameId) REFERENCES games(id),
    FOREIGN KEY (winnerId) REFERENCES players(id)
);*/

// to fetch :
/*
SetRepository.getAllSets().then((sets) => {
    console.log(sets);
});
*/
export const getAllSets = async () => {
    return await db.getAllAsync(`SELECT * from sets`);
};

// UPDATE - Marquer un leg comme gagné
export const markSetAsWon = async (setId, winnerId) => {
    return await db.runAsync(
        `
    UPDATE sets
    SET isOver = 1,
        winnerId = ?
    WHERE id = ?
    `,
        [winnerId, setId],
    );
};

// READ - Nombre de sets gagnés par joueur dans un set
export const countSetsWinsForPlayer = async (gameId, playerId) => {
    const result = await db.getAllAsync(
        `
    SELECT id
    FROM sets
    WHERE gameId = ?
    AND winnerId = ?
    `,
        [gameId, playerId],
    );

    return result.length;
};
