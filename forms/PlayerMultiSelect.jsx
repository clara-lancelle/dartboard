import { useState } from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import AvatarComponent from "../components/AvatarComponent";

export default function PlayerMultiSelectWithToasts({
    players,
    selectedPlayers,
    setSelectedPlayers,
}) {
    const [open, setOpen] = useState(false);

    // Animation pour le dropdown
    const height = useSharedValue(0);
    const toggleDropdown = () => {
        const newValue = !open;
        setOpen(newValue);
        height.value = withTiming(
            newValue ? Math.min(players.length * 50, 250) : 0,
            { duration: 250 },
        );
    };
    const animatedStyle = useAnimatedStyle(() => ({
        height: height.value,
        opacity: height.value === 0 ? 0 : 1,
    }));

    // Ajouter ou retirer un joueur sélectionné
    const togglePlayer = (player) => {
        setSelectedPlayers((prev) => {
            const exists = prev.find((p) => p.id === player.id);
            let newList;
            if (exists) {
                newList = prev.filter((p) => p.id !== player.id);
            } else {
                newList = [...prev, player];
            }
            return newList;
        });
    };

    return (
        <GestureHandlerRootView className="w-full self-center">
            {/* Selecteur */}
            <TouchableOpacity
                className="bg-[#845AE9] text-white p-4 rounded-xl flex-row justify-between align-middle items-center"
                onPress={toggleDropdown}
            >
                <Text className="text-white">
                    {selectedPlayers.length > 0
                        ? `${selectedPlayers.length} joueur(s) sélectionné(s)`
                        : "Sélectionner des joueurs"}
                </Text>
                <Text className="text-white">{open ? "▲" : "▼"}</Text>
            </TouchableOpacity>

            {/* Dropdown */}
            <Animated.View
                className="overflow-hidden mt-2 max-h-48 bg-[#845AE9] text-white rounded-xl"
                style={animatedStyle}
            >
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={true}
                    persistentScrollbar={true}
                    nestedScrollEnabled={true}
                >
                    {players.map((player) => (
                        <TouchableOpacity
                            key={player.id}
                            className={`p-3 flex-row border-b border-gray-700 ${
                                selectedPlayers.find((p) => p.id === player.id)
                                    ? "bg-blue-400"
                                    : "bg-gray-800"
                            }`}
                            onPress={() => togglePlayer(player)}
                        >
                            <AvatarComponent avatar={player.avatar} />
                            <Text className="text-white">{player.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </Animated.View>
        </GestureHandlerRootView>
    );
}
