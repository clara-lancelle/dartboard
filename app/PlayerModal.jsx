import { router } from "expo-router";
import { View } from "react-native";
import PlayerForm from "../forms/PlayerForm";

export default function PlayerModal() {
    const handleSubmit = (name, avatar) => {
        router.replace({
            pathname: "/ParamGameScreen",
            params: {
                newPlayer: JSON.stringify({ name, avatar }),
            },
        });
    };
    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                backgroundColor: "rgba(0,0,0,0.4)",
            }}
        >
            <PlayerForm
                onSubmit={handleSubmit}
                onDismiss={() => router.back()}
                size="small"
            />
        </View>
    );
}
