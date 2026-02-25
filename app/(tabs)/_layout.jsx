import { Tabs } from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "#6A5AE0",
                headerStyle: {
                    backgroundColor: "#6A5AE0",
                },
                headerShadowVisible: true,
                headerTintColor: "#ffff",
                tabBarStyle: {
                    backgroundColor: "#ffff",
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "home-sharp" : "home-outline"}
                            color={color}
                            size={24}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="playersScreen"
                options={{
                    title: "Joueurs",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "people-sharp" : "people-outline"}
                            color={color}
                            size={24}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="statPage"
                options={{
                    title: "Stats",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "podium-sharp" : "podium-outline"}
                            color={color}
                            size={24}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
