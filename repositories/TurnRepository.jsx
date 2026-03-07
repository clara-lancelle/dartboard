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
    const TurnId = await db.runAsync(
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
            legId,
            playerId,
            turnNumber,
            totalScore,
            isBust ? 1 : 0,
            remainingScoreAfter,
            now,
        ],
    );
    return TurnId.lastInsertRowId;
};

export const updateTurn = async ({
    turnId,
    totalScore,
    isBust,
    remainingScoreAfter,
}) => {
    await db.runAsync(
        `
    UPDATE turns
    SET totalScore = ?,
        isBust = ?,
        remainingScoreAfter = ?
    WHERE id = ?
    `,
        [totalScore, isBust ? 1 : 0, remainingScoreAfter, turnId],
    );
    return turnId;
};

//
// READ - Tours d'un leg

//to fetch :
/*
TurnRepository.getTurnsByLegId(currentLeg.id).then((turns) => {
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
