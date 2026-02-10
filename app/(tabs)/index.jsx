import { Text, View } from "react-native";
import PlayButton from "../../components/HomepageComponents/PLayButton";
import Podium from "../../components/HomepageComponents/Podium";
import RecentlyPlayed from "../../components/HomepageComponents/RecentlyPlayed";

export default function Index() {
    return (
        <View className="flex-1 items-center justify-center bg-gray-100 ">
            <Text className="text-2xl font-medium my-4 w-11/12">Hi Mateo,</Text>
            <PlayButton />
            <RecentlyPlayed />
            <Podium />
        </View>
    );
}
