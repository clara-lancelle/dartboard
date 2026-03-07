import { useCallback, useEffect, useState } from "react";
import * as GameRepository from "../repositories/GameRepository";

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
            setPlayerTurns({}); // Reset turns quand on charge une nouvelle partie
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
        (playerId, playerDartIndex) => {
            if (!game || !playerId) {
                return { remaining: game?.startingScore ?? 0, bust: false };
            }

            const currentScore = scores(playerId);

            // Si c'est le joueur courant et qu'il a des darts en cours
            const currentDartsList =
                playerDartIndex === currentPlayerIndex ? currentDarts : [];
            const turnTotal = currentDartsList.reduce(
                (sum, dart) => sum + (dart.score || 0),
                0,
            );

            const remaining = currentScore - turnTotal;
            const bust = remaining < 0;

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
        async (newDarts, turnRepository, dartRepository) => {
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
            const isBust = remainingScore < 0;

            const existingTurns = playerTurns[currentPlayer.id] || {};
            const turnNumber = Object.keys(existingTurns).length;

            try {
                let savedTurnId;
                const turnId = existingTurns[turnNumber]?.id || null;

                // Créer ou mettre à jour le turn
                if (turnId) {
                    // Update
                    await turnRepository.updateTurn({
                        turnId,
                        totalScore,
                        isBust,
                        remainingScoreAfter: remainingScore,
                    });
                    savedTurnId = turnId;
                } else {
                    // Create
                    savedTurnId = await turnRepository.createTurn({
                        legId: currentLeg.id,
                        playerId: currentPlayer.id,
                        turnNumber,
                        totalScore,
                        isBust,
                        remainingScoreAfter: remainingScore,
                    });
                }

                // Créer ou mettre à jour les darts
                const existingDarts = existingTurns[turnNumber]?.darts || [];

                for (let i = 0; i < newDarts.length; i++) {
                    const dart = newDarts[i];
                    const existingDart = existingDarts[i];

                    if (existingDart?.id) {
                        // Update dart
                        await dartRepository.updateDart({
                            dartId: existingDart.id,
                            segment: dart.number,
                            multiplier: dart.multiplier,
                            score: dart.score,
                        });
                    } else {
                        // Create dart
                        await dartRepository.createDart({
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
                            remainingScore,
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
     * Undo : annuler la fléchette courante OU le tour précédent
     */
    const undo = useCallback(
        async (turnRepository, dartRepository) => {
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
                    // Note: tu dois implémenter deleteTurn dans TurnRepository
                    if (turnRepository.deleteTurn) {
                        await turnRepository.deleteTurn(turnToUndo.id);
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
        },
        [
            currentDarts.length,
            currentPlayerIndex,
            playerTurns,
            players,
            removeDart,
        ],
    );

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

        // Fonctions
        scores,
        addDart,
        removeDart,
        validateTurn,
        undo,
        moveToNextPlayer,
        loadGame,
    };
};
