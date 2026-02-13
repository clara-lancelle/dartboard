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
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="dark" />
        </>
    );
}
