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

IONICONS

- set : pin-outline
- leg : golf-outline
- timer : stopwatch-outline

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
    const [turnNumber, setTurnNumber] = useState({});
    const [darts, setDarts] = useState({}); //max 3
    const [turnId, setTurnId] = useState();
    const [dartsId, setDartsId] = useState({});
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

    /* Gestion tour - flechettes */
    const handleTurn = async (darts, turnScore) => {
        if (!game || !currentLeg) return;
        const currentPlayer = players[currentPlayerIndex];
        const currentScore = scores[currentPlayer.id];
        const remainingScoreAfter = currentScore - turnScore;
        const isBust = remainingScoreAfter < 0 ? true : false;
        const newTurnNumber = (turnNumber[currentPlayer.id] ?? 0) + 1;

        setTurnNumber((prev) => {
            const currentTurn = prev[currentPlayer.id] ?? 0;
            return {
                ...prev,
                [currentPlayer.id]: currentTurn + 1,
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
            turnId &&
            turnId[currentPlayer.id] &&
            turnId[currentPlayer.id].turnNumber === newTurnNumber
        ) {
            try {
                await updateTurn(turnId[currentPlayer.id].turnId, {
                    totalScore: turnScore,
                    isBust: isBust,
                    remainingScoreAfter: remainingScoreAfter,
                });
            } catch (e) {
                console.error("updateTurnError", e);
                return;
            }

            try {
                if (turnId) {
                    darts[currentPlayerIndex].map((item, index) => {
                        if (
                            dartsId[currentPlayer.id] &&
                            dartsId[currentPlayer.id][index]
                        ) {
                            //update
                            DartRepository.updateDart({
                                dartId: dartsId[currentPlayer.id][index],
                                number: item.number,
                                multiplier: item.multiplier,
                                score: item.score,
                            });
                            return dartsId[currentPlayer.id][index];
                        }
                    });
                }
            } catch (e) {
                console.error("updateDartError", e);
                return;
            }
        } else {
            //create
            try {
                const createdTurnId = await createTurn({
                    legId: currentLeg,
                    playerId: currentPlayer,
                    turnNumber: newTurnNumber,
                    totalScore: turnScore,
                    isBust: isBust,
                    remainingScoreAfter: remainingScoreAfter,
                });
                setTurnId((prev) => ({
                    ...prev,
                    [currentPlayer.id]: {
                        turnNumber: newTurnNumber,
                        turnId: createdTurnId,
                    },
                }));

                if (turnId) {
                    const currentDartsId = darts[currentPlayerIndex].map(
                        (item) =>
                            DartRepository.createDart({
                                turnId: createdTurnId,
                                segment: item.number,
                                multiplier: item.multiplier,
                                score: item.score,
                            }),
                    );
                    setDartsId((prev) => ({
                        ...prev,
                        [currentPlayer.id]: currentDartsId,
                    }));
                }
                //DartRepository.getDartsByTurnId(turnId).then((darts) => {});
            } catch (e) {
                console.error("createDartorTurnError", e);
                return;
            }
        }

        DartRepository.getDartsByTurnId(turnId).then((item) => {
            console.error("darts for turnId", item);
        });

        //winner
        if (remainingScoreAfter === 0) {
            //gagne le leg
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

    const handleUndoLastTurnDarts = () => {
        //si le joueur 0 et tour 0 = return (pas d'action possible)

        const undoPlayerIndex =
            currentPlayerIndex === 0 &&
            turnNumber[players[currentPlayerIndex].id] === 0
                ? 0
                : currentPlayerIndex - 1 < 0
                  ? players.length - 1
                  : currentPlayerIndex - 1;
        const undoTurnNumber =
            turnNumber[players[undoPlayerIndex].id] === 0
                ? 0
                : turnNumber[players[undoPlayerIndex].id] - 1;

        setCurrentPlayerIndex(undoPlayerIndex);
        setTurnNumber((prev) => {
            return {
                ...prev,
                [players[undoPlayerIndex].id]: undoTurnNumber,
            };
        });
        return;
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
        setDarts((prev) => {
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
                                    const dart = darts[index]?.[i];

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
                                {scores[item.id]}
                            </Text>
                        </View>
                    );
                })}
            </ScrollView>

            <DartKeyboard
                currentPlayerIndex={currentPlayerIndex}
                handleUndoLastTurnDarts={() => handleUndoLastTurnDarts()}
                darts={darts}
                setDarts={setDarts}
                onValidateTurn={(darts, totalScore) => {
                    handleTurn(darts, totalScore);
                }}
            />
        </View>
    );
};

export default GameScreen;
