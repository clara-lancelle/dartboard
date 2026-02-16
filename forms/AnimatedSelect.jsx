import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

export default function AnimatedSelect({
    options,
    selected,
    onSelect,
    placeholder = "Choisir...",
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
        <View className="w-full my-2">
            <TouchableOpacity
                className="bg-[#EFEEFC] border-gray-200 border-2 border-solid p-5 rounded-xl flex-row justify-between items-center"
                onPress={toggle}
            >
                <Text className="text-[#6A5AE0] text-2xl pl-3 font-medium">
                    {selected ? selected.label : placeholder}
                </Text>
                <Animated.View
                    className="text-[#6A5AE0] text-2xl"
                    style={arrowStyle}
                >
                    <Ionicons
                        name="chevron-down-outline"
                        color="#442AD4"
                        size={24}
                    />
                </Animated.View>
            </TouchableOpacity>

            {/* Dropdown */}
            <Animated.View
                className="overflow-hidden mt-1 rounded-xl bg-gray-800"
                style={animatedStyle}
            >
                <ScrollView>
                    {options.map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            className="p-4 border-b border-gray-700"
                            onPress={() => {
                                onSelect(option);
                                toggle();
                            }}
                        >
                            <Text className="text-white text-base">
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </Animated.View>
        </View>
    );
}
