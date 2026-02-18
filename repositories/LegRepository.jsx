import { db } from "../database/db";

// to fetch :
/*
LegRepository.getAllLegs().then((legs) => {
    console.log(legs);
});
*/
export const getAllLegs = async () => {
    return await db.getAllAsync(`SELECT * from legs`);
};

// UPDATE - Marquer un leg comme gagné
export const markLegAsWon = async (legId, winnerId) => {
    return await db.runAsync(
        `
    UPDATE legs
    SET isOver = 1,
        winnerId = ?
    WHERE id = ?
    `,
        [winnerId, legId],
    );
};

// READ - Nombre de legs gagnés par joueur dans un set
export const countLegWinsForPlayer = async (setId, playerId) => {
    const result = await db.getAllAsync(
        `
    SELECT id
    FROM legs
    WHERE setId = ?
    AND winnerId = ?
    `,
        [setId, playerId],
    );

    return result.length;
};
