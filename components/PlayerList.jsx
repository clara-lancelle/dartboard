import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";
import editIcon from "../assets/icons/editer.png";
import binIcon from "../assets/icons/supprimer.png";

const avatarImages = {
    avatar1: require("../assets/avatars/avatar1.png"),
    avatar2: require("../assets/avatars/avatar2.png"),
    avatar3: require("../assets/avatars/avatar3.png"),
    avatar4: require("../assets/avatars/avatar4.png"),
    avatar5: require("../assets/avatars/avatar5.png"),
    avatar6: require("../assets/avatars/avatar6.png"),
    avatar7: require("../assets/avatars/avatar7.png"),
    avatar8: require("../assets/avatars/avatar8.png"),
    avatar9: require("../assets/avatars/avatar9.png"),
    avatar10: require("../assets/avatars/avatar10.png"),
    avatar11: require("../assets/avatars/avatar11.png"),
    avatar12: require("../assets/avatars/avatar12.png"),
};

export default function PlayerList({ players, onUpdatePress, onDeletePress }) {
    return (
        <View className="gap-5 w-11/12 mt-5">
            {(players.length > 0 &&
                players.map(
                    ({ avatar, name, id, created_at_formatted, ...rest }) => (
                        <View
                            key={id}
                            className="h-20 bg-white w-full items-center rounded-xl flex justify-between flex-row gap-4"
                        >
                            <View className="flex-row items-center gap-4 px-4">
                                <Image
                                    source={avatarImages[avatar]}
                                    style={{ width: 50, height: 50 }}
                                    contentFit="cover"
                                />
                                <View>
                                    <Text className="text-lg font-semibold">
                                        {name}
                                    </Text>
                                    <Text className="text-sm text-gray-400">
                                        Créé le : {created_at_formatted}
                                    </Text>
                                </View>
                            </View>

                            <View className="flex flex-row gap-3 px-4">
                                <Pressable
                                    onPress={() =>
                                        onUpdatePress(id, {
                                            name,
                                            avatar,
                                        })
                                    }
                                    style={{ width: 30, height: 30 }}
                                    className=" rounded-full bg-green-100"
                                >
                                    <Image
                                        source={editIcon}
                                        alt="Modifier le joueur"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                        }}
                                        contentFit="cover"
                                    />
                                </Pressable>
                                <Pressable
                                    style={{ width: 30, height: 30 }}
                                    className=" rounded-full bg-red-100"
                                    onPress={() => onDeletePress(id)}
                                >
                                    <Image
                                        source={binIcon}
                                        alt="Supprimer le joueur"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                        }}
                                        contentFit="cover"
                                    />
                                </Pressable>
                            </View>
                        </View>
                    ),
                )) || <Text>Pas encore de joueurs ajoutés.</Text>}
        </View>
    );
}
