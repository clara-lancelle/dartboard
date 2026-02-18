import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import {
    ImageBackground,
    Pressable,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import BtnBgGradient from "../assets/btn_gradient_bg.png";
import ParamGameBg from "../assets/param_game_bg.png";
import AnimatedSelect from "../forms/AnimatedSelect";
import LabelledAnimatedSelect from "../forms/LabelledAnimatedSelect";
import PlayerMultiSelect from "../forms/PlayerMultiSelect";
import SwitchOption from "../forms/SwitchOption";
import * as GameRepository from "../repositories/GameRepository";
import { getAllGameTypes } from "../repositories/GameTypeRepository";
import { getPlayers } from "../repositories/PlayerRepository";
import { validateGame } from "../validations/ValidateGame";

export default function ParamGameScreen() {
    const navigation = useNavigation();
    const [players, setPlayers] = useState([]);
    const [gameTypes, setGameTypes] = useState([]);
    const [selectedGameType, setSelectedGameType] = useState({
        label: "X01",
        value: 1,
    });
    const [x01Score, setX01Score] = useState(301);
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const [selectedCheckIn, setSelectedCheckIn] = useState("Straight");
    const [selectedCheckOut, setSelectedCheckOut] = useState("Double");
    const [selectedNumLegs, setSelectedNumLegs] = useState(1);
    const [selectedNumSets, setSelectedNumSets] = useState(1);
    const [randomFirstPlayer, setRandomFirstPlayer] = useState(true);
    const [error, setError] = useState("");

    const checkOptions = ["Straight", "Double", "Master", "Tous"];
    const legsOptions = [1, 3, 5, 7];
    const setsOptions = [1, 3, 5];
    const x01Options = [101, 201, 301, 401, 501, 601, 701, 801, 901, 1001];

    const OnStartPress = async () => {
        try {
            setError(""); // reset

            const validationError = validateGame(selectedPlayers);
            if (validationError) {
                setError(validationError);
                return;
            }

            let playersOrdered = [...selectedPlayers];

            if (randomFirstPlayer) {
                playersOrdered.sort(() => Math.random() - 0.5);
            }

            // 3️⃣ Création de la game via repository
            const gameId = await GameRepository.createGame({
                selectedPlayers: playersOrdered,
                gameTypeId: selectedGameType.value,
                legsNumber: selectedNumLegs,
                setsNumber: selectedNumSets,
                startingScore: selectedGameType.value == 1 ? x01Score : null,
                checkIn: selectedCheckIn,
                checkOut: selectedCheckOut,
            });

            // Navigation vers GameScreen en passant l'id de la game
            navigation.navigate("GameScreen", { gameId });
        } catch (err) {
            console.error("Erreur création partie:", err);
            setError("Impossible de créer la partie. Réessayez.");
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setGameTypes(getAllGameTypes());
            const data = await getPlayers();
            setPlayers(data);
        };
        loadData();
    }, []);

    const gameTypeOptions = gameTypes.map((g) => ({
        label: g.name,
        value: g.id,
    }));

    return (
        <ImageBackground
            source={ParamGameBg}
            style={{ flex: 1 }}
            resizeMode="cover"
            className=""
        >
            <View className="flex-1 p-4">
                <AnimatedSelect
                    options={gameTypeOptions}
                    selected={selectedGameType}
                    onSelect={setSelectedGameType}
                    placeholder="Mode de jeu"
                />
                <View className="flex-row flex-wrap justify-evenly gap-x-2 mt-8">
                    {selectedGameType.value === 1 && (
                        <View className="w-full">
                            <LabelledAnimatedSelect
                                options={x01Options}
                                selected={x01Score}
                                onSelect={(opt) => setX01Score(opt)}
                                placeholder="Points"
                                width="full"
                            />
                        </View>
                    )}
                    <LabelledAnimatedSelect
                        options={checkOptions}
                        selected={selectedCheckIn}
                        onSelect={(opt) => setSelectedCheckIn(opt)}
                        placeholder="Check In"
                    />
                    <LabelledAnimatedSelect
                        options={checkOptions}
                        selected={selectedCheckOut}
                        onSelect={(opt) => setSelectedCheckOut(opt)}
                        placeholder="Check Out"
                    />

                    <LabelledAnimatedSelect
                        options={setsOptions}
                        selected={selectedNumSets}
                        onSelect={(opt) => setSelectedNumSets(opt)}
                        placeholder="Sets"
                    />
                    <LabelledAnimatedSelect
                        options={legsOptions}
                        selected={selectedNumLegs}
                        onSelect={(opt) => setSelectedNumLegs(opt)}
                        placeholder="Legs"
                    />
                </View>
                <SwitchOption
                    label="Premier joueur aléatoire"
                    value={randomFirstPlayer}
                    onChange={setRandomFirstPlayer}
                />

                {error ? (
                    <Text className="text-red-500 text-lg font-medium self-center">
                        {error}
                    </Text>
                ) : null}
                <PlayerMultiSelect
                    players={players}
                    selectedPlayers={selectedPlayers}
                    onChange={setSelectedPlayers}
                />
                <TouchableOpacity className="mt-auto mb-24 items-center">
                    <ImageBackground
                        source={BtnBgGradient}
                        resizeMode="cover"
                        className="self-center px-14 py-6 rounded-full overflow-hidden"
                    >
                        <Pressable onPress={OnStartPress}>
                            <Text className="font-medium text-lg text-white text-center">
                                Commencer
                            </Text>
                        </Pressable>
                    </ImageBackground>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
}
