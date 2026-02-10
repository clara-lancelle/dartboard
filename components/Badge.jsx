import { Text, View } from "react-native";

export default function Badge({ text = "Terminé", color = "green" }) {
    return (
        <View
            className={`${color === "green" ? "bg-green-200" : "bg-orange-200"} rounded-full px-2 py-1 items-center w-fit h-8`}
        >
            <Text
                className={`${color === "green" ? "text-green-800" : "text-orange-800"} text-sm`}
            >
                {text}
            </Text>
        </View>
    );
}
