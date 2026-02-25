import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { initializeDatabase } from "../database/index";
import "../global.css";

export default function RootLayout() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                await initializeDatabase();
                setReady(true);
            } catch (error) {
                console.error("Database init error:", error);
            }
        };

        init();
    }, []);
    return (
        <>
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: "#6A5AE0",
                    },
                    headerTintColor: "#fff",
                    headerShadowVisible: true,
                }}
            >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                    name="ParamGameScreen"
                    options={{ title: "Paramètres de la partie" }}
                />
                <Stack.Screen name="GameScreen" options={{ title: "Partie" }} />
            </Stack>
            <StatusBar style="light" />
        </>
    );
}
