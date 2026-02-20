import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import DartKeyboard from "../components/DartKeyboard";
import { useGameTimer } from "../hooks/useGameTimer";
import * as DartRepository from "../repositories/DartRepository";
import * as GameRepository from "../repositories/GameRepository";
import * as LegRepository from "../repositories/LegRepository";
import * as SetRepository from "../repositories/SetRepository";
import { createTurn } from "../repositories/TurnRepository";
import { formatTime } from "../utils/timeFormatter";
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
    const [darts, setDarts] = useState({});
    const { seconds } = useGameTimer();
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
            console.log(currentLeg.setId);

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
        //create
        try {
            const turnId = await createTurn({
                legId: currentLeg,
                playerId: currentPlayer,
                turnNumber: turnNumber,
                totalScore: turnScore,
                isBust: isBust,
                remainingScoreAfter: remainingScoreAfter,
            });
            if (turnId) {
                darts.forEach((item) =>
                    DartRepository.createDart({
                        turnId: turnId,
                        segment: item.number,
                        multiplier: item.multiplier,
                        score: item.score,
                    }),
                );
            }
            //DartRepository.getDartsByTurnId(turnId).then((darts) => {});
        } catch (e) {
            console.log("createTurnError", e);
            return;
        }

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

    //Rotation joueur
    const goToNextPlayer = () => {
        setCurrentPlayerIndex((prev) =>
            prev + 1 >= players.length ? 0 : prev + 1,
        );
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
        <ScrollView className="flex-1 bg-[#6A5AE0] px-4 pt-10">
            {/* Header */}
            <View className="flex-row gap-5 justify-evenly">
                <View className="flex justify-center items-center">
                    <Ionicons
                        name="stopwatch-outline"
                        color="#FFFFFF"
                        size={24}
                    />
                    <Text className="text-2xl font-bold text-white">
                        {formatTime(seconds)}
                    </Text>
                </View>
                <View className="flex justify-center items-center">
                    <Ionicons name="golf-outline" color="#FFFFFF" size={24} />
                    <Text className="text-2xl font-bold text-white">
                        {currentSetOrder} / {game.setsNumber}
                    </Text>
                </View>
                <View className="flex justify-center items-center">
                    <Ionicons name="pin-outline" color="#FFFFFF" size={24} />
                    <Text className="text-2xl font-bold text-white">
                        {currentLegOrder} / {game.legsNumber}
                        {console.log(currentLeg)}
                    </Text>
                </View>
            </View>

            <View>
                {players.map((item, index) => {
                    const isCurrent = index === currentPlayerIndex;
                    return (
                        <View
                            key={item.id}
                            className={`p-4 mb-3 rounded-xl ${
                                isCurrent ? "bg-green-600" : "bg-gray-800"
                            }`}
                        >
                            <Text className="text-white text-lg font-semibold">
                                {item.name}
                            </Text>

                            <Text className="text-white text-xl mt-2">
                                Score: {scores[item.id]}
                            </Text>
                        </View>
                    );
                })}
            </View>

            <DartKeyboard
                onValidateTurn={(darts, totalScore) => {
                    handleTurn(darts, totalScore);
                }}
            />
        </ScrollView>
    );
};

export default GameScreen;
