import { Image, ImageBackground, Pressable, Text, View } from "react-native";

const backgrounds = {
    blue: require("../assets/btn_bg.png"),
    green: require("../assets/btn_bg_orange.png"),
};

const icons = {
    target: require("../assets/icons/target.png"),
    add: require("../assets/icons/add.png"),
};

export default function HeroButton({
    bg = "blue",
    text = "",
    icon = "target",
    onPress,
}) {
    const backgroundSource = backgrounds[bg] || backgrounds.blue;
    const iconSource = icons[icon] || icons.target;

    return (
        <View>
            <ImageBackground
                source={backgroundSource}
                className="flex-row items-center justify-center gap-3 px-6 py-4 rounded-3xl overflow-hidden"
                imageStyle={{ borderRadius: 12 }}
            >
                <Pressable
                    onPress={onPress}
                    className="flex-row items-center justify-between gap-5 px-4 py-3 rounded-full w-11/12"
                >
                    <Text className="text-white font-semibold text-2xl">
                        {text}
                    </Text>
                    <Image source={iconSource} className="w-20 h-20" />
                </Pressable>
            </ImageBackground>
        </View>
    );
}
