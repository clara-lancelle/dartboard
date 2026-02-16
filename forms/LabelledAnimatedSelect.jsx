import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

export default function LabelledAnimatedSelect({
    options,
    selected,
    onSelect,
    placeholder = "Choisir...",
    width = "",
}) {
    const [open, setOpen] = useState(false);

    const height = useSharedValue(0);
    const rotate = useSharedValue(0);

    const toggle = () => {
        const newValue = !open;
        setOpen(newValue);

        height.value = withTiming(
            newValue ? Math.min(options.length * 45, 200) : 0,
            { duration: 250 },
        );
        rotate.value = withTiming(newValue ? 180 : 0, { duration: 250 });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        height: height.value,
        opacity: height.value === 0 ? 0 : 1,
    }));

    const arrowStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotate.value}deg` }],
    }));

    return (
        <View className={`${width === "full" ? "w-full" : "w-1/3"} mt-1`}>
            <Text className="text-[#6A5AE0] text-xl ml-1 font-medium">
                {placeholder}
            </Text>
            <TouchableOpacity
                className="bg-white border-gray-200 border-2 border-solid p-4 rounded-xl flex-row justify-between items-center"
                onPress={toggle}
            >
                {selected && <Text className="text-gray-900">{selected}</Text>}
                <Animated.Text
                    className="text-gray-900 text-base"
                    style={arrowStyle}
                >
                    ▼
                </Animated.Text>
            </TouchableOpacity>

            {/* Dropdown */}
            <Animated.View
                className="overflow-hidden mt-1 rounded-lg bg-gray-800"
                style={animatedStyle}
            >
                <ScrollView>
                    {options.map((option, index) => (
                        <TouchableOpacity
                            key={`${placeholder}-${option}`}
                            className="p-4 border-b border-gray-700 "
                            onPress={() => {
                                onSelect(option);
                                toggle();
                            }}
                        >
                            <Text className="text-white text-base">
                                {option}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </Animated.View>
        </View>
    );
}
