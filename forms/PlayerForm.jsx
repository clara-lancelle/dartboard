import { useState } from "react";
import {
    Image,
    ImageBackground,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import BtnBgLinear from "../assets/bg_linear_orange.png";
import BtnBack from "../assets/icons/back.png";
import { validatePlayer } from "../validations/ValidatePlayer";
import AvatarSelector from "./AvatarSelector";

export default function PlayerForm({ onSubmit, onDismiss = false, size = "" }) {
    const [playerName, setPlayerName] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [error, setError] = useState("");
    return (
        <View
            className={`bg-white border-2 border-gray-200 w-11/12 rounded-xl mx-auto ${size === "small" ? "p-3 mb-4" : "p-4 my-4"}`}
        >
            {onDismiss !== false && (
                <Pressable className="mb-4" onPress={onDismiss}>
                    <Image
                        source={BtnBack}
                        contentFit="cover"
                        style={{
                            width: 40,
                            height: 40,
                        }}
                    />
                </Pressable>
            )}

            <TextInput
                value={playerName}
                onChangeText={setPlayerName}
                placeholder="Pseudo du joueur"
                className={`bg-[#EFEEFC] text-[#6A5AE0] placeholder:text-[#6A5AE0] p-4 rounded-xl mb-4`}
            />
            {error ? (
                <Text className="text-red-500 text-xs self-center">
                    {error}
                </Text>
            ) : null}
            <AvatarSelector
                selected={avatar}
                onSelect={setAvatar}
                size="small"
            />
            <ImageBackground
                className="w-1/3 py-4 rounded-3xl items-center border-2 border-gray-200 self-end overflow-hidden"
                source={BtnBgLinear}
            >
                <TouchableOpacity
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
                    <Text className="text-white font-semibold text-base">
                        Ajouter
                    </Text>
                </TouchableOpacity>
            </ImageBackground>
        </View>
    );
}
