// src/services/GameService.js

import { getFullGameById, markLegAsWon } from "../repositories/GameRepository";
import GameTypeRepository from "../repositories/GameTypeRepository";

import { createTurn } from "../repositories/TurnRepository";

import { playTurn } from "../engine/gameEngine";

//
// LOAD GAME
//
export const loadGame = async (gameId) => {
    const { game, players, currentLeg } = await getFullGameById(gameId);

    const gameType = GameTypeRepository.getById(game.gameTypeId);

    const state = initializeState(gameType, players, game);

    return {
        game,
        gameType,
        players,
        currentLeg,
        state,
        turnIndex: 0,
    };
};

//
// INITIAL STATE
//
export const initializeState = (gameType, players, game) => {
    const state = {
        scores: {},
        marks: {},
        targets: {},
        lives: {},
        progress: {},
        isKiller: {},
    };

    players.forEach((p) => {
        if (gameType.modeCategory === "score") {
            state.scores[p.id] = game.startingScore;
        }

        if (gameType.modeCategory === "marks") {
            state.scores[p.id] = 0;
            state.marks[p.id] = {};
        }

        if (gameType.modeCategory === "progression") {
            state.targets[p.id] = 1;
        }

        if (gameType.modeCategory === "lives") {
            state.targets[p.id] = Math.floor(Math.random() * 20) + 1;
            state.lives[p.id] = gameType.defaultParams.lives;
            state.progress[p.id] = 0;
            state.isKiller[p.id] = false;
        }
    });

    return state;
};

//
// HANDLE TURN
//
export const handleTurn = async ({
    game,
    gameType,
    currentLeg,
    player,
    input,
    state,
    turnIndex,
}) => {
    const result = await playTurn({
        game,
        gameType,
        player,
        input,
        state,
    });

    await createTurn({
        legId: currentLeg.id,
        playerId: player.id,
        turnNumber: turnIndex,
        totalScore: input.totalScore || 0,
        isBust: result.isBust,
        remainingScoreAfter: result.newScore ?? null,
    });

    return result;
};

//
// HANDLE LEG WIN
//
export const handleLegWin = async (currentLeg, winnerId) => {
    await markLegAsWon(currentLeg.id, winnerId);
};
