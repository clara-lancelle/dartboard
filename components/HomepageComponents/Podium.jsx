import { Image, ImageBackground, Text, View } from "react-native";
import BtnGradientBg from "../../assets/btn_gradient_bg.png";
import TropheeBronze from "../../assets/icons/trophee_bronze.png";
import TropheeGold from "../../assets/icons/trophee_OR.png";
import TropheeSilver from "../../assets/icons/trophee_SILVER.png";

import Ionicons from "@expo/vector-icons/Ionicons";
import Badge from "../Badge";

export default function Podium() {
    const podiumData = [
        {
            playerName: "Mateo",
            lastGameDate: "02/02/2026",
            victoryCount: 10,
        },
        {
            playerName: "Sarah",
            lastGameDate: "01/02/2026",
            victoryCount: 8,
        },
        {
            playerName: "Nico",
            lastGameDate: "25/01/2026",
            victoryCount: 5,
        },
    ];

    return (
        <View className="w-11/12 mt-6 flex gap-1">
            <Text className="text-xl font-semibold my-2">Classement</Text>
            {podiumData.map(
                ({ playerName, lastGameDate, victoryCount }, index) => (
                    <ImageBackground
                        key={index}
                        source={BtnGradientBg}
                        className="flex-row items-center justify-center gap-3 px-6 py-4 rounded-3xl overflow-hidden"
                        imageStyle={{ borderRadius: 12 }}
                    >
                        <View className="w-full justify-between flex flex-row">
                            <Image
                                source={
                                    index === 0
                                        ? TropheeGold
                                        : index === 1
                                          ? TropheeSilver
                                          : TropheeBronze
                                }
                                className="w-10 h-10"
                            />
                            <View>
                                <Text className="text-white font-semibold">
                                    {playerName}
                                </Text>
                                <View className="flex flex-row items-center">
                                    <Ionicons
                                        name="time-outline"
                                        color="#D3CCFF"
                                        size={14}
                                    />
                                    <Text className="text-indigo-200">
                                        {" "}
                                        dernier jeu : {lastGameDate}
                                    </Text>
                                </View>
                            </View>
                            <Badge
                                color="green"
                                text={
                                    victoryCount === 1
                                        ? `${victoryCount} victoire`
                                        : `${victoryCount} victoires`
                                }
                            />
                        </View>
                    </ImageBackground>
                ),
            )}
        </View>
    );
}
