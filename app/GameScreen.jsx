import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { Alert, ScrollView, Text, View } from "react-native";
import AvatarComponent from "../components/AvatarComponent";
import DartKeyboard from "../forms/DartKeyboard";
import { useGameState } from "../hooks/useGameState";
import * as DartRepository from "../repositories/DartRepository";
import * as LegRepository from "../repositories/LegRepository";
import * as TurnRepository from "../repositories/TurnRepository";

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
        scores,
        addDart,
        removeDart,
        validateTurn,
        undo,
        moveToNextPlayer,
        loadGame,
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

        // ✅ Vérifier victoire du leg
        if (remainingScore === 0) {
            try {
                await LegRepository.markLegAsWon(
                    currentLeg.id,
                    currentPlayer.id,
                );

                Alert.alert(
                    "Leg gagné 🎯",
                    `${currentPlayer.name} gagne le leg !`,
                    [{ text: "OK", onPress: loadGame }],
                );

                // TODO: gérer les sets et le match
                // - Compter les victoires de leg
                // - Passer au prochain leg ou au set suivant
            } catch (error) {
                console.error("Erreur marquage leg:", error);
            }
        }
    };

    /**
     * Gérer l'undo
     */
    const handleUndo = async () => {
        const result = await undo(TurnRepository, DartRepository);
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
                    {/* TODO: Ajouter timer */}
                    {/* <Text className="text-2xl font-bold text-white pt-1">
                        {formatTime(seconds)}
                    </Text> */}
                </View>

                <View className="flex justify-center items-center w-1/3 border-slate-300 border-r-[1px]">
                    <Ionicons name="golf-outline" color="#FFFFFF" size={22} />
                    <Text className="text-2xl font-bold text-white pt-1">
                        {game.currentSet ?? 1} / {game.setsNumber}
                    </Text>
                </View>

                <View className="flex justify-center items-center w-1/3">
                    <Ionicons name="pin-outline" color="#FFFFFF" size={22} />
                    <Text className="text-2xl font-bold text-white pt-1">
                        {game.currentLeg ?? 1} / {game.legsNumber}
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
                            {/* Avatar et nom */}
                            <View className="items-center justify-center flex-1">
                                <AvatarComponent
                                    avatar={player.avatar}
                                    width={40}
                                    marginRight={0}
                                />
                                <Text className="text-gray-700 text-lg font-normal mt-1">
                                    {player.name}
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

                            {/* ✅ Score projeté dynamique avec couleur si bust */}
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
                onRemoveDart={removeDart}
                onUndo={handleUndo}
                onValidateTurn={handleValidateTurn}
            />
        </View>
    );
};

export default GameScreen;
