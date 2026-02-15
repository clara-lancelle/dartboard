import { useNavigation } from "expo-router";
import { ScrollView, Text } from "react-native";
import HeroButton from "../../components/HeroButton";
import Podium from "../../components/HomepageComponents/Podium";
import RecentlyPlayed from "../../components/HomepageComponents/RecentlyPlayed";

export default function Index() {
    const navigation = useNavigation();
    return (
        <ScrollView
            className="flex-1 bg-gray-100"
            contentContainerStyle={{
                alignItems: "center",
                justifyContent: "center",
                flexGrow: 1,
            }}
        >
            <Text className="text-2xl font-medium my-4 w-11/12">Hi Mateo,</Text>
            <HeroButton
                bg="btn_bg.png"
                text="Nouvelle partie"
                icon="target"
                onPress={() => navigation.navigate("ParamGameScreen")}
            />
            <RecentlyPlayed />
            <Podium />
        </ScrollView>
    );
}
