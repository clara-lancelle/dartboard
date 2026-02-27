import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity } from "react-native";
import DraggableFlatList, {
    ScaleDecorator,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AvatarComponent from "../components/AvatarComponent";

export default function PlayerToast({ selectedPlayers, setSelectedPlayers }) {
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
        <GestureHandlerRootView className="w-full mt-0">
            <DraggableFlatList
                data={Object.values(selectedPlayers)}
                keyExtractor={(item) => item.id}
                key={(item) => item.id}
                onDragEnd={({ data }) => {
                    setSelectedPlayers(data);
                    setSelectedPlayers?.(data);
                }}
                renderItem={renderToast}
                horizontal={true} // toasts horizontal
                contentContainerStyle={{ paddingHorizontal: 5, gap: 5 }}
            />
        </GestureHandlerRootView>
    );
}
