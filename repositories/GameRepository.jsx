import { db } from "../database/db";

// CREATE - Créer une nouvelle partie complète
export const createGame = async ({
    selectedPlayers,
    gameTypeId,
    legsNumber,
    setsNumber,
    startingScore,
    checkIn = "SINGLE",
    checkOut = "SINGLE",
}) => {
    const now = new Date().toISOString();

    await db.execAsync("BEGIN TRANSACTION");
    try {
        const gameResult = await db.runAsync(
            `
      INSERT INTO games
      (
        created_at,
        ended_at,
        legsNumber,
        setsNumber,
        gameTypeId,
        winnerId,
        checkIn,
        checkOut,
        startingScore
      )
      VALUES (?, NULL, ?, ?, ?, NULL, ?, ?, ?)
      `,
            [
                now,
                legsNumber,
                setsNumber,
                gameTypeId,
                checkIn,
                checkOut,
                startingScore ?? null,
            ],
        );

        const gameId = gameResult.lastInsertRowId;

        // Associer joueurs
        for (let i = 0; i < selectedPlayers.length; i++) {
            await db.runAsync(
                `
        INSERT INTO player_game
        (gameId, playerId, turnOrder)
        VALUES (?, ?, ?)
        `,
                [
                    gameId,
                    selectedPlayers[i].id,
                    i, // ordre initial
                ],
            );
        }

        // Créer sets + legs
        for (let s = 0; s < setsNumber; s++) {
            const setResult = await db.runAsync(
                `
        INSERT INTO sets
        (gameId, isOver, winnerId, created_at)
        VALUES (?, 0, NULL, ?)
        `,
                [gameId, now],
            );

            const setId = setResult.lastInsertRowId;

            for (let l = 0; l < legsNumber; l++) {
                await db.runAsync(
                    `
          INSERT INTO legs
          (setId, isOver, winnerId, created_at)
          VALUES (?, 0, NULL, ?)
          `,
                    [setId, now],
                );
            }
        }

        await db.execAsync("COMMIT");

        return gameId;
    } catch (error) {
        await db.execAsync("ROLLBACK");
        throw error;
    }
};

// READ - Game + joueurs + leg courant
//to fetch :
/*
const { game, players, currentLeg } = await GameRepository.getFullGameById(gameId);
console.log(game, players, currentLeg);
*/
export const getFullGameById = async (gameId) => {
    const game = await db.getFirstAsync(
        `
    SELECT * FROM games
    WHERE id = ?
    `,
        [gameId],
    );

    const players = await db.getAllAsync(
        `
    SELECT p.*
    FROM players p
    JOIN player_game pg ON pg.playerId = p.id
    WHERE pg.gameId = ?
    ORDER BY pg.turnOrder ASC
    `,
        [gameId],
    );

    const currentLeg = await db.getFirstAsync(
        `
    SELECT l.*
    FROM legs l
    JOIN sets s ON l.setId = s.id
    WHERE s.gameId = ?
    AND l.isOver = 0
    ORDER BY l.id ASC
    LIMIT 1
    `,
        [gameId],
    );

    return { game, players, currentLeg };
};
