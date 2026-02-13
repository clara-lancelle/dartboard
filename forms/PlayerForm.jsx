import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ImageBackground,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import BtnBgLinear from "../assets/bg_linear_orange.png";
import { validatePlayer } from "../validations/ValidatePlayer";
import AvatarSelector from "./AvatarSelector";

export default function PlayerForm({ onSubmit, onDismiss }) {
    const [playerName, setPlayerName] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [error, setError] = useState("");
    return (
        <View className="bg-white my-4 w-11/12 rounded-xl p-4">
            <View className="flex-row w-full justify-between">
                <Text>Pseudo</Text>
                <Pressable onPress={onDismiss}>
                    <Ionicons
                        name="arrow-back-outline"
                        color="#6A5EEA"
                        size={30}
                    />
                </Pressable>
            </View>
            <TextInput
                value={playerName}
                onChangeText={setPlayerName}
                className="bg-white p-3 rounded-xl mb-4"
                placeholder="Pseudo du joueur"
            />
            {error ? (
                <Text className="text-red-500 text-xs self-center">
                    {error}
                </Text>
            ) : null}
            <Text className="mb-2">Avatar</Text>
            <AvatarSelector selected={avatar} onSelect={setAvatar} />
            <ImageBackground
                className="w-1/3 p-3 rounded-3xl items-center self-end overflow-hidden"
                source={BtnBgLinear}
            >
                <Pressable
                    className="rounded-full"
                    onPress={() => {
                        const validationError = validatePlayer(playerName, {
                            required: false,
                        });

                        if (validationError) {
                            setError(validationError);
                            return;
                        }
                        onSubmit(playerName, avatar);
                    }}
                >
                    <Text className="text-white font-semibold text-sm">
                        Ajouter
                    </Text>
                </Pressable>
            </ImageBackground>
        </View>
    );
}
