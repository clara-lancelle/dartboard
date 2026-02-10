import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, Text, View } from "react-native";
import ClockIcon from "../../assets/icons/clock.png";
import Badge from "../Badge";

export default function RecentlyPlayed() {
    const games = [
        { type: "501", gameStatus: "Terminé", date: "02/02/2026" },
        { type: "301", gameStatus: "En cours", date: "01/02/2026" },
        { type: "Cricket", gameStatus: "Terminé", date: "25/01/2026" },
        { type: "CCT", gameStatus: "En cours", date: "15/01/2026" },
    ];
    return (
        <View className="flex w-11/12">
            <View className="mt-5 mb-4 flex-row justify-start items-center gap-2">
                <Image source={ClockIcon} className="w-6 h-6" />
                <Text className="text-xl font-semibold">Récemment joués</Text>
            </View>
            <View className="flex flex-row flex-wrap justify-evenly gap-4">
                {games.map(({ type, gameStatus, date }, index) => (
                    <View
                        key={index}
                        className="flex flex-row flex-wrap w-[47%] justify-between gap-y-3 bg-white p-3 rounded-xl h-24"
                    >
                        <Text
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            className="text-2xl font-bold w-16"
                        >
                            {type}
                        </Text>{" "}
                        <Badge
                            color={
                                gameStatus === "Terminé" ? "green" : "orange"
                            }
                            text={gameStatus}
                        />
                        <View className="flex flex-row items-center gap-1">
                            <Ionicons
                                name="time-outline"
                                color="#442AD4"
                                size={14}
                            />

                            <Text className="text-indigo-600">{date}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}
