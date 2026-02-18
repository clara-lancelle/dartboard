import { useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import DartKeyboard from "../components/DartKeyboard";
import * as DartRepository from "../repositories/DartRepository";
import * as GameRepository from "../repositories/GameRepository";
import * as LegRepository from "../repositories/LegRepository";
import { createTurn } from "../repositories/TurnRepository";

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

    /*
   |--------------------------------------------------------------------------
   | Load Game
   |--------------------------------------------------------------------------
   */

    const loadGame = useCallback(async () => {
        try {
            const { game, players, currentLeg } =
                await GameRepository.getFullGameById(gameId);

            //console.log(game, players, currentLeg);

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
        console.log(darts);

        const currentPlayer = players[currentPlayerIndex];
        const currentScore = scores[currentPlayer.id];
        const remainingScoreAfter = currentScore - turnScore;
        const isBust = remainingScoreAfter < 0 ? true : false;
        setTurnNumber((prev) => ({
            ...prev,
            [currentPlayer.id]: !turnNumber[currentPlayer.id]
                ? 0
                : turnNumber[currentPlayer.id] + 1,
        }));
        // Update score
        setScores((prev) => ({
            ...prev,
            [currentPlayer.id]: remainingScoreAfter,
        }));

        console.log(
            "createTurn",
            currentLeg.id,
            currentPlayer.id,
            turnNumber,
            turnScore,
            isBust,
            remainingScoreAfter,
        );
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
            DartRepository.getDartsByTurnId(turnId).then((darts) => {});
        } catch (e) {
            console.log("createTurnError", e);
            return;
        }

        //bust
        if (isBust) {
            goToNextPlayer();
        }

        //winner
        if (remainingScoreAfter === 0) {
            await LegRepository.markLegAsWon(currentLeg.id, currentPlayer.id);

            Alert.alert(
                "Leg gagné 🎯",
                `${currentPlayer.name} gagne le leg !`,
                [{ text: "OK", onPress: loadGame }],
            );

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
        <ScrollView className="flex-1 bg-black px-4 pt-10">
            {/* Header */}
            <Text className="text-white text-2xl font-bold text-center mb-6">
                Game #{game.id}
            </Text>

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
