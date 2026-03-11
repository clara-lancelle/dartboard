import { useCallback, useEffect, useState } from "react";
import * as DartRepository from "../repositories/DartRepository";
import * as GameRepository from "../repositories/GameRepository";
import * as TurnRepository from "../repositories/TurnRepository";

export const useGameState = (gameId) => {
    // ========== ÉTATS PRIMITIFS ==========
    const [game, setGame] = useState(null);
    const [players, setPlayers] = useState([]);
    const [currentLeg, setCurrentLeg] = useState(null);
    const [loading, setLoading] = useState(true);

    // ========== ÉTATS DU JEU ==========
    const [playerTurns, setPlayerTurns] = useState({});
    const [currentDarts, setCurrentDarts] = useState([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

    // ========== ÉTATS DES VICTOIRES ==========
    const [legWinsByPlayer, setLegWinsByPlayer] = useState({});
    const [setWinsByPlayer, setSetWinsByPlayer] = useState({});
    const [currentSetNumber, setCurrentSetNumber] = useState(1);
    const [currentLegNumber, setCurrentLegNumber] = useState(1);

    // ========== LOAD GAME ==========
    useEffect(() => {
        loadGame();
    }, [gameId]);

    const loadGame = useCallback(async () => {
        try {
            setLoading(true);
            const { game, players, currentLeg } =
                await GameRepository.getFullGameById(gameId);

            setGame(game);
            setPlayers(players);
            setCurrentLeg(currentLeg);
            setCurrentPlayerIndex(0);
            setCurrentDarts([]);
            setPlayerTurns({});

            // Initialiser les compteurs de victoires
            const initialWins = {};
            players.forEach((p) => {
                initialWins[p.id] = 0;
            });
            setLegWinsByPlayer(initialWins);
            setSetWinsByPlayer(initialWins);
            setCurrentSetNumber(1);
            setCurrentLegNumber(1);
        } catch (error) {
            console.error("Erreur chargement game:", error);
        } finally {
            setLoading(false);
        }
    }, [gameId]);

    // ========== COMPUTED VALUES ==========
    const currentPlayer = players?.[currentPlayerIndex] ?? null;

    const scores = useCallback(
        (playerId) => {
            if (!playerId || !game) {
                return game?.startingScore ?? 0;
            }

            const turns = playerTurns[playerId] || {};
            let score = game.startingScore;

            Object.values(turns).forEach((turn) => {
                if (turn && !turn.isBust) {
                    score -= turn.totalScore;
                }
            });

            return score;
        },
        [playerTurns, game?.startingScore, game],
    );

    const currentPlayerScore = currentPlayer ? scores(currentPlayer.id) : 0;

    /**
     * Calculer le score projeté (en temps réel) pour un joueur
     * = score actuel - somme des darts en cours
     */
    const computeProjectedScore = useCallback(
        (playerId, isCurrentPlayer) => {
            if (!game || !playerId) {
                return { remaining: game?.startingScore ?? 0, bust: false };
            }

            const currentScore = scores(playerId);
            // Si c'est le joueur courant et qu'il a des darts en cours
            const currentDartsList = isCurrentPlayer ? currentDarts : [];
            const turnTotal = currentDartsList.reduce(
                (sum, dart) => sum + (dart.score || 0),
                0,
            );

            const remaining = currentScore - turnTotal;
            console.log("computeProjectedScore", {
                playerId,
                currentPlayerIndex,
                currentScore,
                remaining,
                turnTotal,
                currentDartsList,
            });
            const bust = remaining < 0 || remaining <= game.checkout;
            //bust && validateTurn(currentDartsList);

            return { remaining, bust };
        },
        [scores, currentPlayerIndex, currentDarts, game],
    );

    // ========== ACTIONS ==========

    /**
     * Ajouter une fléchette au tour courant
     */
    const addDart = useCallback(
        (dart) => {
            if (!dart || currentDarts.length >= 3) return;
            setCurrentDarts((prev) => [...prev, dart]);
        },
        [currentDarts.length],
    );

    /**
     * Retirer la dernière fléchette du tour courant
     */
    const removeDart = useCallback(() => {
        setCurrentDarts((prev) => {
            if (prev.length === 0) return prev;
            return prev.slice(0, -1);
        });
    }, []);

    /**
     * Valider le tour courant (sauvegarder dans playerTurns et DB)
     */
    const validateTurn = useCallback(
        async (newDarts) => {
            if (
                !currentPlayer ||
                !currentLeg ||
                !newDarts ||
                newDarts.length === 0
            ) {
                console.warn("validateTurn: données manquantes", {
                    currentPlayer,
                    currentLeg,
                    newDarts,
                });
                return { success: false, error: "Données manquantes" };
            }

            const totalScore = newDarts.reduce((s, d) => s + (d.score || 0), 0);
            const remainingScore = currentPlayerScore - totalScore;
            const isBust =
                remainingScore < 0 || remainingScore <= game.checkout; // En cas de bust, le score reste le même
            const existingTurns = playerTurns[currentPlayer.id] || {};
            const turnNumber = Object.keys(existingTurns).length;
            const remainingScoreAfter = isBust
                ? currentPlayerScore
                : remainingScore;
            try {
                let savedTurnId;
                const turnId = existingTurns[turnNumber]?.id || null;

                // Créer ou mettre à jour le turn
                if (turnId) {
                    // Update
                    await TurnRepository.updateTurn({
                        turnId,
                        totalScore,
                        isBust,
                        remainingScoreAfter,
                    });
                    savedTurnId = turnId;
                } else {
                    // Create
                    savedTurnId = await TurnRepository.createTurn({
                        legId: currentLeg.id,
                        playerId: currentPlayer.id,
                        turnNumber,
                        totalScore,
                        isBust,
                        remainingScoreAfter,
                    });
                }

                // Créer ou mettre à jour les darts
                const existingDarts = existingTurns[turnNumber]?.darts || [];

                for (let i = 0; i < newDarts.length; i++) {
                    const dart = newDarts[i];
                    const existingDart = existingDarts[i];

                    if (existingDart?.id) {
                        // Update dart
                        await DartRepository.updateDart({
                            dartId: existingDart.id,
                            segment: dart.number,
                            multiplier: dart.multiplier,
                            score: dart.score,
                        });
                    } else {
                        // Create dart
                        await DartRepository.createDart({
                            turnId: savedTurnId,
                            segment: dart.number,
                            multiplier: dart.multiplier,
                            score: dart.score,
                        });
                    }
                }

                // Mettre à jour l'état local
                setPlayerTurns((prev) => ({
                    ...prev,
                    [currentPlayer.id]: {
                        ...existingTurns,
                        [turnNumber]: {
                            id: savedTurnId,
                            darts: newDarts,
                            totalScore,
                            isBust,
                            remainingScoreAfter,
                        },
                    },
                }));

                // Réinitialiser et passer au joueur suivant
                setCurrentDarts([]);
                moveToNextPlayer();

                return { success: true, remainingScore };
            } catch (error) {
                console.error("Erreur validation turn:", error);
                return { success: false, error };
            }
        },
        [currentPlayer, currentPlayerScore, playerTurns, currentLeg],
    );

    /**
     * Vérifier si quelqu'un a gagné le leg/set/match et gérer la suite
     */
    const checkWinConditions = useCallback(
        async (playerId, legRepository, setRepository, gameRepository) => {
            try {
                // 1️⃣ Marquer le leg comme gagné
                await legRepository.markLegAsWon(currentLeg.id, playerId);

                // 2️⃣ Incrémenter les victoires de leg
                const updatedLegWins = (legWinsByPlayer[playerId] ?? 0) + 1;
                setLegWinsByPlayer((prev) => ({
                    ...prev,
                    [playerId]: updatedLegWins,
                }));

                // 3️⃣ Vérifier victoire du set (best of)
                const legsToWin = Math.ceil(game.legsNumber / 2);
                if (updatedLegWins >= legsToWin) {
                    // Le joueur a gagné le set
                    await setRepository.markSetAsWon(
                        currentLeg.setId,
                        playerId,
                    );

                    const updatedSetWins = (setWinsByPlayer[playerId] ?? 0) + 1;
                    setSetWinsByPlayer((prev) => ({
                        ...prev,
                        [playerId]: updatedSetWins,
                    }));

                    console.log("Set gagné par le joueur", playerId, {
                        updatedLegWins,
                        updatedSetWins,
                        "in game": game,
                    });
                    // 4️⃣ Vérifier victoire du match
                    const setsToWin = Math.ceil(game.setsNumber / 2);
                    if (updatedSetWins >= setsToWin) {
                        // Le joueur a gagné le match !
                        await gameRepository.markGameAsWon(game.id, playerId);

                        return {
                            type: "MATCH_WON",
                            winner: playerId,
                            legWins: updatedLegWins,
                            setWins: updatedSetWins,
                        };
                    } else {
                        // Le set est gagné, on passe au set suivant
                        return {
                            type: "SET_WON",
                            winner: playerId,
                            legWins: updatedLegWins,
                            setWins: updatedSetWins,
                        };
                    }
                } else {
                    // Le leg est gagné, on passe au leg suivant du même set
                    return {
                        type: "LEG_WON",
                        winner: playerId,
                        legWins: updatedLegWins,
                        setWins: setWinsByPlayer[playerId] ?? 0,
                    };
                }
            } catch (error) {
                console.error("Erreur dans checkWinConditions:", error);
                return { type: "ERROR", error };
            }
        },
        [game, currentLeg, legWinsByPlayer, setWinsByPlayer],
    );

    /**
     * Charger le leg suivant et réinitialiser l'état du jeu
     */
    const loadNextLeg = useCallback(async () => {
        try {
            // Charger la nouvelle partie (leg suivant)
            const { currentLeg } = await GameRepository.getFullGameById(gameId);

            setCurrentLeg(currentLeg);
            setCurrentLegNumber((prev) => prev + 1);
            setPlayerTurns({}); // Réinitialiser les turns
            setCurrentDarts([]);
            setCurrentPlayerIndex(0); // Le joueur qui a commencé recommence

            return true;
        } catch (error) {
            console.error("Erreur loadNextLeg:", error);
            return false;
        }
    }, [gameId]);

    /**
     * Charger le set suivant et réinitialiser l'état
     */
    const loadNextSet = useCallback(async () => {
        try {
            const { currentLeg } = await GameRepository.getFullGameById(gameId);

            setCurrentLeg(currentLeg);
            setCurrentSetNumber((prev) => prev + 1);
            setCurrentLegNumber(1); // Recommencer les legs
            setPlayerTurns({});
            setCurrentDarts([]);
            setCurrentPlayerIndex(0);

            // Réinitialiser les compteurs de leg
            const initialLegWins = {};
            players.forEach((p) => {
                initialLegWins[p.id] = 0;
            });
            setLegWinsByPlayer(initialLegWins);

            return true;
        } catch (error) {
            console.error("Erreur loadNextSet:", error);
            return false;
        }
    }, [gameId, players]);

    /**
     * Undo : annuler la fléchette courante OU le tour précédent
     */
    const undo = useCallback(async () => {
        // Cas 1 : il y a des fléchettes en cours → enlever la dernière
        if (currentDarts.length > 0) {
            removeDart();
            return { success: true };
        }

        // Cas 2 : pas de fléchettes en cours → undo le tour du joueur précédent
        if (players.length === 0) {
            console.warn("Aucun joueur disponible");
            return { success: false };
        }

        const prevPlayerIndex =
            currentPlayerIndex === 0
                ? players.length - 1
                : currentPlayerIndex - 1;
        const prevPlayer = players[prevPlayerIndex];

        if (!prevPlayer) {
            console.warn("Joueur précédent introuvable");
            return { success: false };
        }

        const prevTurns = playerTurns[prevPlayer.id] || {};
        const turnNumbers = Object.keys(prevTurns).map(Number);
        const prevTurnNumber =
            turnNumbers.length > 0 ? Math.max(...turnNumbers) : -1;

        if (prevTurnNumber < 0) {
            console.warn("Aucun tour à annuler");
            return { success: false };
        }

        const turnToUndo = prevTurns[prevTurnNumber];

        if (!turnToUndo) {
            console.warn("Tour à annuler introuvable");
            return { success: false };
        }

        try {
            // Supprimer en DB si le turn a un ID
            if (turnToUndo.id) {
                if (TurnRepository.deleteTurn) {
                    await TurnRepository.deleteTurn(turnToUndo.id);
                }
            }

            // Mettre à jour l'état : supprimer le tour
            setPlayerTurns((prev) => {
                const newState = { ...prev };
                const playerTurnsObj = { ...newState[prevPlayer.id] };
                delete playerTurnsObj[prevTurnNumber];
                newState[prevPlayer.id] = playerTurnsObj;
                return newState;
            });

            // Restaurer l'écran d'input avec les darts du tour annulé
            setCurrentDarts(turnToUndo.darts || []);

            // Passer au joueur précédent
            setCurrentPlayerIndex(prevPlayerIndex);

            return { success: true };
        } catch (error) {
            console.error("Erreur undo:", error);
            return { success: false, error };
        }
    }, [
        currentDarts.length,
        currentPlayerIndex,
        playerTurns,
        players,
        removeDart,
    ]);

    /**
     * Passer au joueur suivant
     */
    const moveToNextPlayer = useCallback(() => {
        setCurrentPlayerIndex((prev) => {
            const newIndex = prev + 1 >= players.length ? 0 : prev + 1;
            return newIndex;
        });
        setCurrentDarts([]);
    }, [players.length]);

    // ========== RETURN ==========
    return {
        // État du jeu
        game,
        players,
        currentLeg,
        loading,

        // État UI
        playerTurns,
        currentDarts,
        currentPlayerIndex,
        currentPlayer,
        currentPlayerScore,
        computeProjectedScore,

        // Victoires
        legWinsByPlayer,
        setWinsByPlayer,
        currentSetNumber,
        currentLegNumber,

        // Fonctions
        addDart,
        validateTurn,
        undo,
        moveToNextPlayer,
        loadGame,
        checkWinConditions,
        loadNextLeg,
        loadNextSet,
    };
};
