import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { Alert, ScrollView, Text, View } from "react-native";
import AvatarComponent from "../components/AvatarComponent";
import DartKeyboard from "../forms/DartKeyboard";
import { useGameState } from "../hooks/useGameState";
import * as DartRepository from "../repositories/DartRepository";
import * as GameRepository from "../repositories/GameRepository";
import * as LegRepository from "../repositories/LegRepository";
import * as SetRepository from "../repositories/SetRepository";
import * as TurnRepository from "../repositories/TurnRepository";

/**TODO
 * Affichage BUSTED !
 * Voir les stats après victoire
 * Retour a l'accueil après victoire
 * verif if remainingscore === 0 && last dart is double or bull
 * Ajouter un bouton "Terminer le leg" pour les cas où le joueur ne peut pas finir (ex: 1 point restant)
 * Ajouter un bouton "Terminer le set" pour les cas où les joueurs veulent arrêter avant la fin (ex: 2-0 dans un set de 3 legs)
 * Ajouter un bouton "Terminer la partie" pour les cas où les joueurs veulent arrêter avant la fin (ex: 2-0 dans un match de 3 sets)
 * Ajouter une confirmation pour ces boutons
 * Gérer les égalités dans les legs (ex: tous les joueurs tombent à 0 ou moins dans le même tour) => on peut faire repartir le leg à 501 pour les joueurs concernés, ou faire repartir tout le monde à 501
 * Gérer les égalités dans les sets (ex: tous les joueurs gagnent le même nombre de legs) => on peut faire repartir un leg supplémentaire en cas d'égalité, ou faire
 **/

const GameScreen = () => {
    const route = useRoute();
    const { gameId } = route.params;

    // ✅ Le hook charge tout et gère tout l'état
    const {
        game,
        players,
        currentLeg,
        loading,
        currentDarts,
        currentPlayerIndex,
        currentPlayer,
        currentPlayerScore,
        playerTurns,
        computeProjectedScore,
        legWinsByPlayer,
        setWinsByPlayer,
        currentSetNumber,
        currentLegNumber,
        addDart,
        validateTurn,
        undo,
        moveToNextPlayer,
        loadGame,
        checkWinConditions,
        loadNextLeg,
        loadNextSet,
    } = useGameState(gameId);

    // ========== HANDLERS ==========

    /**
     * Gérer la validation d'un tour
     */
    const handleValidateTurn = async (totalScore, newDarts) => {
        const result = await validateTurn(
            newDarts,
            TurnRepository,
            DartRepository,
        );

        if (!result.success) {
            console.warn("Validation du turn échouée:", result.error);
            return;
        }

        const { remainingScore } = result;

        // ✅ Vérifier victoire
        if (remainingScore === 0) {
            const winResult = await checkWinConditions(
                currentPlayer.id,
                LegRepository,
                SetRepository,
                GameRepository,
            );

            if (!winResult || winResult.type === "ERROR") {
                console.error("Erreur lors de la vérification des victoires");
                return;
            }

            // ========== LEG WON ==========
            if (winResult.type === "LEG_WON") {
                Alert.alert(
                    "Leg gagné 🎯",
                    `${currentPlayer.name} gagne le leg !\n\n${winResult.legWins}/${game.legsNumber}`,
                    [
                        {
                            text: "Continuer",
                            onPress: async () => {
                                const success = await loadNextLeg();
                                if (!success) {
                                    Alert.alert(
                                        "Erreur",
                                        "Impossible de charger le leg suivant",
                                    );
                                }
                            },
                        },
                    ],
                );
            }

            // ========== SET WON ==========
            else if (winResult.type === "SET_WON") {
                Alert.alert(
                    "Set gagné 🏆",
                    `${currentPlayer.name} gagne le set !\n\n${winResult.setWins}/${game.setsNumber}`,
                    [
                        {
                            text: "Continuer",
                            onPress: async () => {
                                const success = await loadNextSet();
                                if (!success) {
                                    Alert.alert(
                                        "Erreur",
                                        "Impossible de charger le set suivant",
                                    );
                                }
                            },
                        },
                    ],
                );
            }

            // ========== MATCH WON ==========
            else if (winResult.type === "MATCH_WON") {
                Alert.alert(
                    "Partie terminée 🎉",
                    `${currentPlayer.name} gagne le match !\n\n${winResult.setWins}/${game.setsNumber} sets`,
                    [
                        {
                            text: "Nouvelle partie",
                            onPress: () => {
                                // TODO: Naviguer vers l'écran d'accueil
                                // navigation.navigate("HomeScreen");
                            },
                        },
                    ],
                );
            }
        }
    };

    /**
     * Gérer l'undo
     */
    const handleUndo = async () => {
        const result = await undo(TurnRepository);
        if (!result.success) {
            console.warn("Undo échoué:", result.error);
        }
    };

    // ========== RENDER ==========

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-black">
                <Text className="text-white text-lg">Chargement...</Text>
            </View>
        );
    }

    if (!game) {
        return (
            <View className="flex-1 items-center justify-center bg-black">
                <Text className="text-white text-lg">Partie introuvable</Text>
            </View>
        );
    }

    if (!currentLeg) {
        return (
            <View className="flex-1 items-center justify-center bg-black">
                <Text className="text-white text-lg">Leg non trouvé</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#EFEEFC]">
            {/* ========== HEADER ========== */}
            <View className="flex-row bg-[#6A5AE0] rounded-b-2xl py-8 px-2 w-[99%] mx-auto">
                <View className="flex justify-center items-center w-1/3 border-slate-300 border-r-[1px]">
                    <Ionicons
                        name="stopwatch-outline"
                        color="#FFFFFF"
                        size={22}
                    />
                </View>

                <View className="flex justify-center items-center w-1/3 border-slate-300 border-r-[1px]">
                    <Ionicons name="golf-outline" color="#FFFFFF" size={22} />
                    <Text className="text-2xl font-bold text-white pt-1">
                        {currentSetNumber} / {game.setsNumber}
                    </Text>
                </View>

                <View className="flex justify-center items-center w-1/3">
                    <Ionicons name="pin-outline" color="#FFFFFF" size={22} />
                    <Text className="text-2xl font-bold text-white pt-1">
                        {currentLegNumber} / {game.legsNumber}
                    </Text>
                </View>
            </View>

            {/* ========== AFFICHAGE DES JOUEURS ========== */}
            <ScrollView className="mt-2 p-4">
                {players.map((player, index) => {
                    const isCurrent = index === currentPlayerIndex;
                    const playerDarts = isCurrent ? currentDarts : [];
                    const { remaining, bust } = computeProjectedScore(
                        player.id,
                        index,
                    );

                    return (
                        <View
                            key={player.id}
                            className={`p-4 mb-3 rounded-2xl flex-row justify-between items-center transition-all ${
                                isCurrent ? "bg-[#FFB380]" : "bg-white"
                            }`}
                        >
                            {/* Avatar, nom et compteurs */}
                            <View className="items-center justify-center flex-1">
                                <AvatarComponent
                                    avatar={player.avatar}
                                    width={40}
                                    marginRight={0}
                                />
                                <Text className="text-gray-700 text-lg font-normal mt-1">
                                    {player.name}
                                </Text>
                                <Text className="text-gray-600 text-sm">
                                    {legWinsByPlayer[player.id] ?? 0}L{" "}
                                    {setWinsByPlayer[player.id] ?? 0}S
                                </Text>
                            </View>

                            {/* Affichage des 3 darts */}
                            <View className="flex-row justify-center items-center flex-1">
                                {Array.from({ length: 3 }).map((_, i) => {
                                    const dart = playerDarts[i];
                                    return (
                                        <View
                                            key={i}
                                            className="w-10 h-10 bg-gray-800 rounded-lg mx-2 items-center justify-center"
                                        >
                                            {dart ? (
                                                <Text className="text-white text-base font-bold">
                                                    {dart.multiplier}x
                                                    {dart.number}
                                                </Text>
                                            ) : null}
                                        </View>
                                    );
                                })}
                            </View>

                            {/* Score projeté dynamique */}
                            <Text
                                className={`text-2xl font-semibold flex-1 text-right ${
                                    bust ? "text-red-600" : "text-gray-800"
                                }`}
                            >
                                {remaining}
                            </Text>
                        </View>
                    );
                })}
            </ScrollView>

            {/* ========== DART KEYBOARD ========== */}
            <DartKeyboard
                currentDarts={currentDarts}
                onAddDart={addDart}
                onUndo={handleUndo}
                onValidateTurn={handleValidateTurn}
            />
        </View>
    );
};

export default GameScreen;
