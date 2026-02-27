import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function DartKeyboard({
    currentPlayer,
    onValidateTurn,
    darts,
    setDarts,
}) {
    const [multiplier, setMultiplier] = useState(1);
    const numbers = Array.from({ length: 21 }, (_, i) => i); // 0 → 20

    const handleNumberPress = (number) => {
        if (darts.length >= 3) return;

        const score = number * multiplier;

        setDarts((prev) => {
            const currentDarts = prev[currentPlayer] || [];
            return {
                ...prev,
                [currentPlayer]: [
                    ...currentDarts,
                    {
                        number,
                        multiplier,
                        score,
                    },
                ],
            };
        });

        console.log("tutu", darts[currentPlayer]);
        // Reset multiplier après chaque fléchette
        setMultiplier(1);

        if (darts[currentPlayer] && darts[currentPlayer].length === 3) {
            const total = darts[currentPlayer].reduce(
                (sum, d) => sum + d.score,
                0,
            );
            onValidateTurn(darts, total);
            setDarts([]);
        }
    };

    const handleUndo = () => {
        setDarts((prev) => prev.slice(0, -1));
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
