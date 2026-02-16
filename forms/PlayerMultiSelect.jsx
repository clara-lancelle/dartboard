import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import DraggableFlatList, {
    ScaleDecorator,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import AvatarComponent from "../components/AvatarComponent";

export default function PlayerMultiSelectWithToasts({ players, onChange }) {
    const [selectedPlayers, setSelectedPlayers] = useState([]);
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
            onChange?.(newList);
            return newList;
        });
    };

    const renderToast = ({ item, drag, isActive }) => (
        <ScaleDecorator>
            <TouchableOpacity
                onLongPress={drag}
                className={`px-2 py-2 rounded-lg mb-2 flex-row align-middle gap-1 ${
                    isActive ? "bg-blue-300" : "bg-white"
                }`}
            >
                <AvatarComponent avatar={item.avatar} />
                <Text className="text-grey-900 font-semibold self-center">
                    {item.name}
                </Text>
                <Ionicons
                    name="reorder-three-outline"
                    color="#D9D9D9"
                    size={24}
                />
            </TouchableOpacity>
        </ScaleDecorator>
    );

    return (
        <GestureHandlerRootView className="w-full my-2">
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
                className="overflow-hidden mt-2 max-h-52 bg-[#845AE9] text-white rounded-xl"
                style={animatedStyle}
            >
                <ScrollView
                    showsVerticalScrollIndicator={true}
                    persistentScrollbar={true}
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

            {/* Toasts des joueurs sélectionnés */}
            <View className="mt-3">
                <DraggableFlatList
                    data={selectedPlayers}
                    keyExtractor={(item) => item.id}
                    onDragEnd={({ data }) => {
                        setSelectedPlayers(data);
                        onChange?.(data);
                    }}
                    renderItem={renderToast}
                    horizontal={true} // toasts horizontal
                    contentContainerStyle={{ paddingHorizontal: 5, gap: 5 }}
                />
            </View>
        </GestureHandlerRootView>
    );
}
