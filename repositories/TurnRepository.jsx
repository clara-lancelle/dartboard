import { db } from "../database/db";

// CREATE - Ajouter un tour
export const createTurn = async ({
    legId,
    playerId,
    turnNumber,
    totalScore,
    isBust,
    remainingScoreAfter,
}) => {
    const now = new Date().toISOString();
    const turnResult = await db.runAsync(
        `
    INSERT INTO turns
    (
      legId,
      playerId,
      turnNumber,
      totalScore,
      isBust,
      remainingScoreAfter,
       created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
        [
            legId.id,
            playerId.id,
            turnNumber,
            totalScore,
            isBust ? 1 : 0,
            remainingScoreAfter,
            now,
        ],
    );
    const gameId = turnResult.lastInsertRowId;
    return gameId;
};

//
// READ - Tours d'un leg

//to fetch :
/*
TurnRep[playerId.id]ository.getTurnsByLegId(currentLeg.id).then((turns) => {
    console.log(turns);
});
*/
export const getTurnsByLegId = async (legId) => {
    return await db.getAllAsync(
        `
    SELECT *
    FROM turns
    WHERE legId = ?
    ORDER BY turnNumber ASC
    `,
        [legId],
    );
};
