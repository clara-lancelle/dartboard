import { Image, ImageBackground, Pressable, Text, View } from "react-native";
import BtnBg from "../../assets/btn_bg.png";
import TargetIcon from "../../assets/icons/target.png";

export default function PlayButton() {
    return (
        <View>
            <ImageBackground
                source={BtnBg}
                className="flex-row items-center justify-center gap-3 px-6 py-4 rounded-3xl overflow-hidden"
                imageStyle={{ borderRadius: 12 }}
            >
                <Pressable className="flex-row items-center justify-between gap-5 px-4 py-3 rounded-full w-11/12">
                    <Text className="text-white font-semibold text-2xl">
                        Nouvelle partie
                    </Text>
                    <Image source={TargetIcon} className="w-20 h-20" />
                </Pressable>
            </ImageBackground>
        </View>
    );
}
