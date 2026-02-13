import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import AvatarSelector from "./AvatarSelector";

export default function PlayerForm({ onSubmit }) {
    const [playerName, setPlayerName] = useState("");
    const [avatar, setAvatar] = useState(null);
    return (
        <View className="bg-white my-4 w-11/12 rounded-xl p-4">
            <Text>Pseudo</Text>
            <TextInput
                value={playerName}
                onChangeText={setPlayerName}
                className="bg-white p-3 rounded-xl mb-4"
                placeholder="Pseudo du joueur"
            />
            <Text className="mb-2">Avatar</Text>
            <AvatarSelector selected={avatar} onSelect={setAvatar} />
            <Button
                title="Ajouter"
                onPress={() => onSubmit(playerName, avatar)}
            />
        </View>
    );
}
