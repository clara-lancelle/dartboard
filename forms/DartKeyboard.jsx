import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function DartKeyboard({
    currentDarts = [],
    onAddDart,
    onRemoveDart,
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
     * Gérer le clic sur Bull
     */
    const handleBullPress = () => {
        if (currentDarts.length >= 3) {
            console.warn("Déjà 3 fléchettes lancées");
            return;
        }

        const dart = {
            number: 25,
            multiplier: 1, // Bull ne peut pas être en double/triple
            score: 50,
        };

        onAddDart(dart);

        // ✅ Validation automatique à 3 darts
        if (currentDarts.length === 2) {
            const newDarts = [...currentDarts, dart];
            const total = newDarts.reduce((sum, d) => sum + (d.score || 0), 0);

            console.log("Auto-validation (Bull):", { newDarts, total });
            onValidateTurn(total, newDarts);
        }

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
        <View className="my-4 mx-1 rounded-t-2xl bg-[#6A5AE0] p-4">
            {/* ========== BOUTONS NOMBRES ========== */}
            <View className="flex-row flex-wrap justify-center mb-3">
                {numbers.map((num) => (
                    <TouchableOpacity
                        key={`number-${num}`}
                        onPress={() => handleNumberPress(num)}
                        disabled={currentDarts.length >= 3}
                        className={`w-14 h-14 m-1 rounded-lg items-center justify-center ${
                            currentDarts.length >= 3
                                ? "bg-gray-400 opacity-50"
                                : "bg-white"
                        }`}
                    >
                        <Text
                            className={`text-lg font-bold ${
                                currentDarts.length >= 3
                                    ? "text-gray-600"
                                    : "text-gray-900"
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
                        onPress={handleBullPress}
                        disabled={currentDarts.length >= 3}
                        className={`w-14 h-14 m-1 rounded-lg items-center justify-center ${
                            currentDarts.length >= 3
                                ? "bg-green-900 opacity-50"
                                : "bg-green-700"
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
                    className="w-14 h-14 bg-gray-600 m-1 rounded-lg items-center justify-center active:bg-gray-700"
                >
                    <Ionicons
                        name="backspace-outline"
                        size={24}
                        color={"#fff"}
                    />
                </TouchableOpacity>
            </View>

            {/* ========== MULTIPLICATEURS ========== */}
            <View className="flex-row justify-center">
                {[1, 2, 3].map((m) => (
                    <TouchableOpacity
                        key={`multiplier-${m}`}
                        onPress={() => handleMultiplierChange(m)}
                        className={`px-6 py-3 m-2 rounded-lg ${
                            multiplier === m ? "bg-red-600" : "bg-gray-700"
                        }`}
                    >
                        <Text className="text-white font-bold text-lg">
                            {m === 1 ? "Single" : m === 2 ? "Double" : "Triple"}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}
