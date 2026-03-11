import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function DartKeyboard({
    currentDarts = [],
    onAddDart,
    onUndo,
    onValidateTurn,
}) {
    const [multiplier, setMultiplier] = useState(1);

    // Nombres de 0 à 20
    const numbers = Array.from({ length: 21 }, (_, i) => i);

    // ========== HANDLERS ==========

    /**
     * Gérer le clic sur un nombre
     */
    const handleNumberPress = (number) => {
        if (currentDarts.length >= 3) {
            console.warn("Déjà 3 fléchettes lancées");
            return;
        }

        const dart = {
            number,
            multiplier,
            score: number * multiplier,
        };

        onAddDart(dart);

        // ✅ Validation automatique à 3 darts
        if (currentDarts.length === 2) {
            // À ce stade, currentDarts a 2 éléments
            // Après addDart, il en aura 3
            const newDarts = [...currentDarts, dart];
            const total = newDarts.reduce((sum, d) => sum + (d.score || 0), 0);

            console.log("Auto-validation:", { newDarts, total });
            onValidateTurn(total, newDarts);
        }

        // Réinitialiser le multiplicateur
        setMultiplier(1);
    };

    /**
     * Gérer l'undo
     */
    const handleUndo = async () => {
        if (!onUndo) {
            console.warn("onUndo callback not provided");
            return;
        }
        await onUndo();
    };

    /**
     * Gérer le changement de multiplicateur
     */
    const handleMultiplierChange = (newMultiplier) => {
        setMultiplier(newMultiplier);
    };

    // ========== RENDER ==========

    return (
        <View className="my-4 rounded-t-2xl bg-[#6A5AE0] px-1 py-3 border-y-[1px] border-x-[1px] border-gray-300">
            {/* ========== MULTIPLICATEURS ========== */}
            <View className="flex-row justify-center">
                {[1, 2, 3].map((m) => (
                    <TouchableOpacity
                        key={`multiplier-${m}`}
                        onPress={() => handleMultiplierChange(m)}
                        className={`px-8 py-2 m-2 rounded-lg ${
                            multiplier === m
                                ? "bg-[#FFB380]"
                                : "bg-[#D9D4F7] opacity-50"
                        }`}
                    >
                        <Text className="text-white font-bold text-lg">
                            {m === 1 ? "1x" : m === 2 ? "2x" : "3x"}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            {/* ========== BOUTONS NOMBRES ========== */}
            <View className="flex-row flex-wrap justify-center mb-10">
                {numbers.map((num) => (
                    <TouchableOpacity
                        key={`number-${num}`}
                        onPress={() => handleNumberPress(num)}
                        disabled={currentDarts.length >= 3}
                        className={`w-14 h-14 m-1 rounded-lg items-center justify-center ${
                            currentDarts.length >= 3
                                ? "bg-gray-400 opacity-50"
                                : "bg-[#8473FF] border-[1px] border-gray-300 shadow"
                        }`}
                    >
                        <Text
                            className={`text-lg font-bold ${
                                currentDarts.length >= 3
                                    ? "text-gray-600"
                                    : "text-white"
                            }`}
                        >
                            {num}
                        </Text>
                    </TouchableOpacity>
                ))}

                {/* ========== BULL ========== */}
                {multiplier !== 3 && (
                    <TouchableOpacity
                        key="bull"
                        onPress={() => handleNumberPress(25)}
                        disabled={currentDarts.length >= 3}
                        className={`w-14 h-14 m-1 rounded-lg items-center justify-center ${
                            currentDarts.length >= 3
                                ? "bg-green-900 opacity-50"
                                : "bg-[#8473FF] border-[1px] border-[#C9FFE8]"
                        }`}
                    >
                        <Text
                            className={`font-bold ${
                                currentDarts.length >= 3
                                    ? "text-green-300"
                                    : "text-white"
                            }`}
                        >
                            Bull
                        </Text>
                    </TouchableOpacity>
                )}

                {/* ========== UNDO ========== */}
                <TouchableOpacity
                    key="undo"
                    onPress={handleUndo}
                    className="w-14 h-14 bg-gray-600 m-1 border-[1px] border-gray-400 rounded-lg items-center justify-center active:bg-gray-700"
                >
                    <Ionicons
                        name="backspace-outline"
                        size={24}
                        color={"#fff"}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}
