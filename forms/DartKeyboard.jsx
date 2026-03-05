import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function DartKeyboard({
    currentPlayerIndex,
    onValidateTurn,
    handleUndoLastTurnDarts,
    setCurrentDarts,
    currentDarts,
}) {
    const [multiplier, setMultiplier] = useState(1);
    const numbers = Array.from({ length: 21 }, (_, i) => i); // 0 → 20

    const handleNumberPress = (number) => {
        const score = number * multiplier;

        setCurrentDarts((prev) => {
            const playedDarts = prev[currentPlayerIndex] || [];
            if (playedDarts.length >= 3) return prev;

            const newDarts = [
                ...playedDarts,
                {
                    number,
                    multiplier,
                    score,
                },
            ];

            // Si on vient d'ajouter la 3ème fléchette, déclencher la validation
            if (newDarts.length === 3) {
                handle3Darts(newDarts);
            }

            setMultiplier(1);

            return {
                ...prev,
                [currentPlayerIndex]: newDarts,
            };
        });
    };

    const handle3Darts = (newDarts) => {
        const total = newDarts.reduce((sum, d) => sum + d.score, 0);
        console.log("validate turn - darts", newDarts, "total", total);
        onValidateTurn(total, newDarts);
    };

    const handleUndo = () => {
        const playedDarts = currentDarts[currentPlayerIndex] || [];

        if (playedDarts.length > 0) {
            setCurrentDarts((prev) => {
                // Il y a des darts en cours → enlever la dernière
                return {
                    ...prev,
                    [currentPlayerIndex]: playedDarts.slice(0, -1),
                };
            });
        } else {
            // Pas de dart en cours → undo le tour précédent
            handleUndoLastTurnDarts();
        }
    };

    return (
        <View className="my-4 mx-1 rounded-t-2xl bg-[#6A5AE0] p-4">
            {/* Numéros */}
            <View className="flex-row flex-wrap justify-center">
                {numbers.map((num) => (
                    <TouchableOpacity
                        key={num}
                        onPress={() => handleNumberPress(num)}
                        className="w-14 h-14 bg-white m-1 rounded-lg items-center justify-center"
                    >
                        <Text className="text-gray-900 font-bold">{num}</Text>
                    </TouchableOpacity>
                ))}

                {/* Bull */}
                {multiplier !== 3 && (
                    <TouchableOpacity
                        onPress={() => handleNumberPress(25)}
                        className="w-14 h-14 bg-green-700 m-1 rounded-lg items-center justify-center"
                    >
                        <Text className="text-white font-bold">Bull</Text>
                    </TouchableOpacity>
                )}
                {/* Undo */}
                <TouchableOpacity
                    onPress={handleUndo}
                    className="w-14 h-14 bg-gray-600 m-1 rounded-lg items-center justify-center"
                >
                    <Ionicons
                        name="backspace-outline"
                        size={24}
                        color={"#fff"}
                    />
                </TouchableOpacity>
            </View>

            {/* Multipliers */}
            <View className="flex-row justify-center mb-3">
                {[1, 2, 3].map((m) => (
                    <TouchableOpacity
                        key={m}
                        onPress={() => setMultiplier(m)}
                        className={`p-4 m-2 rounded-lg ${
                            multiplier === m ? "bg-red-600" : "bg-gray-700"
                        }`}
                    >
                        <Text className="text-white font-bold">
                            {m === 1 ? "Simple" : m === 2 ? "Double" : "Triple"}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}
