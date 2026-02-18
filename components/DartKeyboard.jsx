import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function DartKeyboard({ onValidateTurn }) {
    const [multiplier, setMultiplier] = useState(1);
    const [darts, setDarts] = useState([]); //max 3

    const numbers = Array.from({ length: 21 }, (_, i) => i); // 0 → 20

    const handleNumberPress = (number) => {
        if (darts.length >= 3) return;

        const score = number * multiplier;

        const newDarts = [
            ...darts,
            {
                number,
                multiplier,
                score,
            },
        ];

        setDarts(newDarts);

        // Reset multiplier après chaque fléchette
        setMultiplier(1);

        if (newDarts.length === 3) {
            const total = newDarts.reduce((sum, d) => sum + d.score, 0);
            onValidateTurn(newDarts, total);
            setDarts([]);
        }
    };

    const handleUndo = () => {
        setDarts((prev) => prev.slice(0, -1));
    };

    return (
        <View className="mt-4">
            {/* Multipliers */}
            <View className="flex-row justify-center mb-3">
                {[1, 2, 3].map((m) => (
                    <TouchableOpacity
                        key={m}
                        onPress={() => setMultiplier(m)}
                        className={`px-4 py-2 mx-2 rounded-lg ${
                            multiplier === m ? "bg-red-600" : "bg-gray-700"
                        }`}
                    >
                        <Text className="text-white font-bold">
                            {m === 1 ? "Simple" : m === 2 ? "Double" : "Triple"}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Darts en cours */}
            <View className="flex-row justify-center mb-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <View
                        key={i}
                        className="w-16 h-16 bg-gray-800 rounded-lg mx-2 items-center justify-center"
                    >
                        <Text className="text-white text-lg">
                            {darts[i]
                                ? `${darts[i].multiplier}x${darts[i].number}`
                                : "-"}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Numéros */}
            <View className="flex-row flex-wrap justify-center">
                {numbers.map((num) => (
                    <TouchableOpacity
                        key={num}
                        onPress={() => handleNumberPress(num)}
                        className="w-14 h-14 bg-blue-700 m-1 rounded-lg items-center justify-center"
                    >
                        <Text className="text-white font-bold">{num}</Text>
                    </TouchableOpacity>
                ))}

                {/* Bull */}
                <TouchableOpacity
                    onPress={() => handleNumberPress(25)}
                    className="w-14 h-14 bg-green-700 m-1 rounded-lg items-center justify-center"
                >
                    <Text className="text-white font-bold">Bull</Text>
                </TouchableOpacity>
            </View>

            {/* Undo */}
            <TouchableOpacity
                onPress={handleUndo}
                className="mt-3 bg-gray-600 py-3 rounded-lg"
            >
                <Text className="text-white text-center font-bold">
                    Annuler dernière fléchette
                </Text>
            </TouchableOpacity>
        </View>
    );
}
