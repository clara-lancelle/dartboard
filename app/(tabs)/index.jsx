import { Text, View } from "react-native";
import HeroButton from "../../components/HeroButton";
import Podium from "../../components/HomepageComponents/Podium";
import RecentlyPlayed from "../../components/HomepageComponents/RecentlyPlayed";

export default function Index() {
    return (
        <View className="flex-1 items-center justify-center bg-gray-100 ">
            <Text className="text-2xl font-medium my-4 w-11/12">Hi Mateo,</Text>
            <HeroButton bg="btn_bg.png" text="Nouvelle partie" icon="target" />
            <RecentlyPlayed />
            <Podium />
        </View>
    );
}
