import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import AvatarComponent from "../components/AvatarComponent";
import DartKeyboard from "../forms/DartKeyboard";
import * as DartRepository from "../repositories/DartRepository";
import * as GameRepository from "../repositories/GameRepository";
import * as LegRepository from "../repositories/LegRepository";
import * as SetRepository from "../repositories/SetRepository";
import { createTurn, updateTurn } from "../repositories/TurnRepository";
/*  TO DO 

- Voir pour autres modes de jeu,
- le joueur se trompe, update turn & flechettes tour precedent
- fin de la parie - ouvelle partie ? enregistrer ? stats ? 
- isBust = message ? 
- afficher le score restant dynamiquement

*/

/* 
computedTurns = {
    playerId: {
        turnNumber: turnId
    }
}

computedDarts = {
    playerId: {
        turnId: {
            dartId: {
                segment,
                multiplier,
                score
            }
        }
    }
}   

currentDarts = {   
    playerIndex: [
        {
            segment,
            multiplier,
            score
        }
    ]
}

currentTurnNumber = {
    playerId: turnNumber
}

scores = {
    playerId: score
}

*/

const GameScreen = () => {
    const route = useRoute();
    const { gameId } = route.params;
    const [game, setGame] = useState(null);
    const [players, setPlayers] = useState([]);
    const [currentLeg, setCurrentLeg] = useState(null);
    const [scores, setScores] = useState({});
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [currentTurnNumber, setCurrentTurnNumber] = useState({});
    const [currentDarts, setCurrentDarts] = useState({}); //max 3
    const [computedTurns, setComputedTurns] = useState({});
    const [computedDarts, setComputedDarts] = useState({});
    //const { seconds } = useGameTimer();
    const [currentLegOrder, setCurrentLegOrder] = useState(0);
    const [currentSetOrder, setCurrentSetOrder] = useState(0);
    const [countLegWinsForPlayer, setCountLegWinsForPlayer] = useState({});
    const [countSetWinsForPlayer, setCountSetWinsForPlayer] = useState({});
    /*
   |--------------------------------------------------------------------------
   | Load Game
   |--------------------------------------------------------------------------
   */

    // LOAD *************************************************************************
    const loadGame = useCallback(async () => {
        try {
            const { game, players, currentLeg } =
                await GameRepository.getFullGameById(gameId);

            setGame(game);
            setPlayers(players);
            setCurrentLeg(currentLeg);

            // Initialisation des scores
            const initialScores = {};
            players.forEach((p) => {
                initialScores[p.id] = game.startingScore ?? 0;
            });
            setScores(initialScores);
        } catch (error) {
            console.error("Erreur chargement game:", error);
        } finally {
            setLoading(false);
        }
    }, [gameId]);

    useEffect(() => {
        loadGame();
    }, []);

    // TURN MANAGEMENT ***********************************************************************
    const handleTurn = async (turnScore, newDarts) => {
        if (!game || !currentLeg) return;
        const currentPlayer = players[currentPlayerIndex];
        const currentScore = scores[currentPlayer.id];
        const remainingScoreAfter = currentScore - turnScore;
        const isBust = remainingScoreAfter < 0 ? true : false;
        const newTurnNumber = (currentTurnNumber[currentPlayer.id] ?? 0) + 1;

        setCurrentTurnNumber((prev) => {
            return {
                ...prev,
                [currentPlayer.id]: newTurnNumber,
            };
        });

        //bust
        if (!isBust) {
            // Update score

            setScores((prev) => ({
                ...prev,
                [currentPlayer.id]: remainingScoreAfter,
            }));
        }

        //check if exists (undo a turn) - update instead of create
        if (
            computedTurns &&
            computedTurns[currentPlayer.id] &&
            computedTurns[currentPlayer.id].hasOwnProperty(newTurnNumber)
        ) {
            const existingTurnId =
                computedTurns[currentPlayer.id][newTurnNumber];
            try {
                await updateTurn({
                    turnId: existingTurnId,
                    totalScore: turnScore,
                    isBust: isBust,
                    remainingScoreAfter: remainingScoreAfter,
                }).then((turnId) => {
                    setComputedTurns((prev) => {
                        const playerTurns = prev[currentPlayer.id] || {};
                        return {
                            ...prev,
                            [currentPlayer.id]: {
                                ...playerTurns,
                                [newTurnNumber]: turnId,
                            },
                        };
                    });
                    newDarts.map(async (item, index) => {
                        if (
                            computedDarts[currentPlayer.id][existingTurnId] &&
                            computedDarts[currentPlayer.id][existingTurnId][
                                index
                            ]
                        ) {
                            //update
                            await DartRepository.updateDart({
                                dartId: computedDarts[currentPlayer.id][
                                    existingTurnId
                                ][index],
                                segment: item.number,
                                multiplier: item.multiplier,
                                score: item.score,
                            }).then((dartId) => {
                                setComputedDarts((prev) => {
                                    const playerTurns =
                                        prev[currentPlayer.id] || {};
                                    const turnData = playerTurns[turnId] || {};
                                    return {
                                        ...prev,
                                        [currentPlayer.id]: {
                                            ...playerTurns,
                                            [turnId]: {
                                                ...turnData,
                                                [dartId]: newDarts[index],
                                            },
                                        },
                                    };
                                });
                            });
                        }
                    });
                });
            } catch (e) {
                console.error("updateDartError", e);
                return;
            }
        } else {
            //create
            try {
                await createTurn({
                    legId: currentLeg,
                    playerId: currentPlayer,
                    turnNumber: newTurnNumber,
                    totalScore: turnScore,
                    isBust: isBust,
                    remainingScoreAfter: remainingScoreAfter,
                }).then((turnId) => {
                    setComputedTurns((prev) => {
                        const playerTurns = prev[currentPlayer.id] || {};
                        return {
                            ...prev,
                            [currentPlayer.id]: {
                                ...playerTurns,
                                [newTurnNumber]: turnId,
                            },
                        };
                    });
                    console.log(newDarts, "newdarts");
                    newDarts.map(
                        async (item, index) =>
                            await DartRepository.createDart({
                                turnId: turnId,
                                segment: item.number,
                                multiplier: item.multiplier,
                                score: item.score,
                            }).then((dartId) => {
                                setComputedDarts((prev) => {
                                    const playerTurns =
                                        prev[currentPlayer.id] || {};
                                    const turnData = playerTurns[turnId] || {};
                                    return {
                                        ...prev,
                                        [currentPlayer.id]: {
                                            ...playerTurns,
                                            [turnId]: {
                                                ...turnData,
                                                [dartId]: newDarts[index],
                                            },
                                        },
                                    };
                                });
                            }),
                    );
                });
                //DartRepository.getDartsByTurnId(turnId).then((darts) => {});
            } catch (e) {
                console.error("createDartOrTurnError", e);
                return;
            }
        }

        //winner
        if (remainingScoreAfter === 0) {
            //gagne le leg
            console.log("leg gagné !");
            await LegRepository.markLegAsWon(currentLeg.id, currentPlayer.id);
            // ajoute une victoire de leg au joueur
            setCountLegWinsForPlayer((prev) => {
                const currentLegCount = prev[currentPlayer.id] ?? 0;
                return {
                    ...prev,
                    [currentPlayer.id]: currentLegCount + 1,
                };
            });
            console.log("countLegWinsForPlayer", countLegWinsForPlayer);

            Alert.alert(
                "Leg gagné 🎯",
                `${currentPlayer.name} gagne le leg !`,
                [{ text: "OK", onPress: loadGame }],
            );

            if (countLegWinsForPlayer[currentPlayer.id] === game.legsNumber) {
                //le premier jooueur dont le nombre de victoires == legsnumber : winner
                SetRepository.markSetAsWon(currentLeg.setId, currentPlayer.id);
                // ajoute une victoire de leg au joueur
                setCountSetWinsForPlayer((prev) => {
                    const currentSetCount = prev[currentPlayer.id] ?? 0;
                    return {
                        ...prev,
                        [currentPlayer.id]: currentSetCount + 1,
                    };
                });
                console.log("countLegWinsForPlayer", countLegWinsForPlayer);
                Alert.alert(
                    "Set gagné 🎯",
                    `${currentPlayer.name} gagne le set !`,
                    [{ text: "OK", onPress: loadGame }],
                );
                if (
                    countSetWinsForPlayer[currentPlayer.id] === game.setsNumber
                ) {
                    //gagne le jeu
                    GameRepository.markGameAsWon(game.id);
                    Alert.alert(
                        "Partie terminée 🎯",
                        `${currentPlayer.name} gagne la partie !`,
                        [{ text: "OK", onPress: loadGame }], // on press new game !
                    );
                } else {
                    //si terminé les legs - reviens a 0 - passe a un nouveau set
                    setCurrentSetOrder((prev) => prev + 1);
                    setCurrentLegOrder(0); //penser a changer le legid dans le load
                }
            } else {
                setCurrentLegOrder((prev) => prev + 1); //penser a changer le legid dans le load
            }

            return;
        }

        goToNextPlayer();
    };

    // UNDO ***********************************************************************
    const handleUndoLastTurnDarts = () => {
        const prevPlayerIndex =
            currentPlayerIndex === 0
                ? players.length - 1
                : currentPlayerIndex - 1;
        const prevPlayerId = players[prevPlayerIndex].id;
        const currentPrevTurnNumber = currentTurnNumber[prevPlayerId] || 0;

        const prevTurnId =
            computedTurns?.[prevPlayerId]?.[currentPrevTurnNumber];
        console.log("handleUndoLastTurnDarts", {
            prevPlayerIndex,
            prevPlayerId,
            currentPrevTurnNumber,
            prevTurnId,
            computedTurns,
        });
        if (!prevTurnId) {
            console.log("Aucun tour à annuler trouvé");
            return;
        }
        const dartsToRestore = Object.values(
            computedDarts?.[prevPlayerId]?.[prevTurnId] ?? [],
        );

        if (dartsToRestore.length === 0) {
            console.log("Aucunes fléchettes à annuler trouvées");
            return;
        }
        dartsToRestore.slice(0, -2);
        // set currentdarts, currentplayerindex, currentturnnumber (pour le tour annulé)
        setCurrentDarts((prev) => ({
            ...prev,
            [prevPlayerIndex]: dartsToRestore,
        }));
        setCurrentPlayerIndex(prevPlayerIndex);
        setCurrentTurnNumber((prev) => ({
            ...prev,
            [prevPlayerId]: currentPrevTurnNumber - 1,
        }));

        // recalcul score du joueur
        const scoreOfCanceledTurn = dartsToRestore.reduce(
            (sum, dart) => sum + (dart.score ?? 0),
            0,
        );
        const restoredScore = scores[prevPlayerId] + scoreOfCanceledTurn;

        setScores((prev) => ({
            ...prev,
            [prevPlayerId]: restoredScore,
        }));
        console.log(
            `Undo : Joueur ${prevPlayerId}, tour ${currentPrevTurnNumber}, ` +
                `score restauré à ${restoredScore}, darts = ${dartsToRestore.length}`,
        );

        //si le joueur 0 et tour 0 = return (pas d'action possible)
        /*const undoPlayerIndex =
            currentPlayerIndex === 0 &&
            currentTurnNumber[players[currentPlayerIndex].id] === 0
                ? 0
                : currentPlayerIndex - 1 < 0
                  ? players.length - 1
                  : currentPlayerIndex - 1;
        const undoTurnNumber =
            currentTurnNumber[players[undoPlayerIndex].id] === 0
                ? 0
                : currentTurnNumber[players[undoPlayerIndex].id] - 1;
        const undoTurnId =
            computedTurns?.[players[undoPlayerIndex].id]?.[
                currentTurnNumber[players[undoPlayerIndex].id]
            ];
        if (!undoTurnId) {
            console.log("Aucun tour à annuler trouvé");
            return;
        }

        const lastDarts = Object.values(
            computedDarts?.[players[undoPlayerIndex].id]?.[undoTurnId] || [],
        );
        if (!lastDarts.length) {
            console.log("Aucunes flechettes à annuler trouvées");
            return;
        }
        lastDarts.sort((a, b) => b.dartId - a.dartId); //trier pour retirer dans l'ordre
        //lastDarts.slice(0, -1); // retirer la dernière fléchette jouée
        setCurrentDarts((prev) => {
            return {
                ...prev,
                [undoPlayerIndex]: lastDarts.slice(0, -1),
            };
        });
        setCurrentPlayerIndex(undoPlayerIndex);
        console.log(lastDarts.slice(0, -1), "lastDarts");
        const remainingScoreAfter =
            scores[players[undoPlayerIndex].id] -
                lastDarts.slice(0, -1).reduce((s, d) => s + d.score, 0) ||
            scores[players[undoPlayerIndex].id];
        // retrieve score before the undone turn
        setScores((prev) => ({
            ...prev,
            [players[undoPlayerIndex].id]: remainingScoreAfter,
        }));

        setCurrentPlayerIndex(undoPlayerIndex);
        setCurrentTurnNumber((prev) => {
            return {
                ...prev,
                [players[undoPlayerIndex].id]: undoTurnNumber,
            };
        });
        return;*/
    };

    // COMPUTE PROJECTED SCORE ***********************************************************************
    const computeProjected = (playerId, playerIndex) => {
        const currentScore = scores[playerId] ?? 0;
        const turnTotal = (currentDarts[playerIndex] || []).reduce(
            (s, d) => s + d.score,
            0,
        );
        const remaining =
            playerIndex === currentPlayerIndex &&
            currentDarts[playerIndex]?.length !== 3
                ? currentScore - turnTotal
                : currentScore;

        return { remaining, bust: remaining < 0 };
    };

    //Rotation joueur
    const goToNextPlayer = () => {
        setCurrentPlayerIndex((prev) =>
            prev + 1 >= players.length ? 0 : prev + 1,
        );
        const newIndex =
            currentPlayerIndex + 1 >= players.length
                ? 0
                : currentPlayerIndex + 1;
        setCurrentDarts((prev) => {
            return {
                ...prev,
                [newIndex]: [],
            };
        });
    };
    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-black">
                <Text className="text-white">Chargement...</Text>
            </View>
        );
    }

    if (!game) {
        return (
            <View className="flex-1 items-center justify-center bg-black">
                <Text className="text-white">Partie introuvable</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#EFEEFC]">
            {/* Header */}
            <View className="flex-row bg-[#6A5AE0] rounded-b-2xl py-8 px-2 w-[99%] mx-auto">
                <View className="flex justify-center items-center w-1/3 border-slate-300 border-r-[1px]">
                    <Ionicons
                        name="stopwatch-outline"
                        color="#FFFFFF"
                        size={22}
                    />
                    {/*<Text className="text-2xl font-bold text-white pt-1">
                        {formatTime(seconds)}
                    </Text>*/}
                </View>
                <View className="flex justify-center items-center w-1/3 border-slate-300 border-r-[1px]">
                    <Ionicons name="golf-outline" color="#FFFFFF" size={22} />
                    <Text className="text-2xl font-bold text-white pt-1">
                        {currentSetOrder} / {game.setsNumber}
                    </Text>
                </View>
                <View className="flex justify-center items-center w-1/3">
                    <Ionicons name="pin-outline" color="#FFFFFF" size={22} />
                    <Text className="text-2xl font-bold text-white pt-1">
                        {currentLegOrder} / {game.legsNumber}
                    </Text>
                </View>
            </View>

            <ScrollView className="mt-2 p-4">
                {players.map((item, index) => {
                    const isCurrent = index === currentPlayerIndex;
                    const { bust, remaining } = computeProjected(
                        item.id,
                        index,
                    );
                    return (
                        <View
                            key={item.id}
                            className={`p-4 mb-3 rounded-2xl flex-row justify-between align-middle items-center ${
                                isCurrent ? "bg-[#FFB380]" : "bg-white"
                            }`}
                        >
                            <View className="items-center justify-center ">
                                <AvatarComponent
                                    avatar={item.avatar}
                                    width={40}
                                    marginRight={0}
                                />
                                <Text className="text-gray-700 text-lg font-normal">
                                    {item.name}
                                </Text>
                            </View>

                            <View className="flex-row justify-center items-center">
                                {Array.from({ length: 3 }).map((_, i) => {
                                    const dart = currentDarts[index]?.[i];

                                    return (
                                        <View
                                            key={i}
                                            className="w-10 h-10 bg-gray-800 rounded-lg mx-2 items-center justify-center"
                                        >
                                            {dart && (
                                                <Text className="text-white text-base">
                                                    {dart.multiplier}x
                                                    {dart.number}
                                                </Text>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>

                            <Text className="text-gray-800 text-2xl font-semibold">
                                {remaining}
                            </Text>
                        </View>
                    );
                })}
            </ScrollView>

            <DartKeyboard
                currentPlayerIndex={currentPlayerIndex}
                handleUndoLastTurnDarts={() => handleUndoLastTurnDarts()}
                currentDarts={currentDarts}
                setCurrentDarts={setCurrentDarts}
                onValidateTurn={(totalScore, newDarts) => {
                    handleTurn(totalScore, newDarts);
                }}
            />
        </View>
    );
};

export default GameScreen;
