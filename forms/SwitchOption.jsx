import { Switch, Text, View } from "react-native";

export default function SwitchOption({ label, value, onChange }) {
    return (
        <View className="flex-row justify-between items-center my-2">
            <Text className="text-base text-[#6A5AE0] font-medium">
                {label}
            </Text>
            <Switch
                thumbColor="#845AE9"
                value={value}
                onValueChange={onChange}
            />
        </View>
    );
}
