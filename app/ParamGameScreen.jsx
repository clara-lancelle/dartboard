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
import GameTypeRepository from "../repositories/GameTypeRepository";
import { getPlayers } from "../repositories/PlayerRepository";
import { validateGame } from "../validations/ValidateGame";

export default function ParamGameScreen() {
    const [players, setPlayers] = useState([]);
    const [gameTypes, setGameTypes] = useState([]);
    const [selectedGameType, setSelectedGameType] = useState({
        label: "X01",
        value: 1,
    });
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const [selectedCheckIn, setSelectedCheckIn] = useState("Straight");
    const [selectedCheckOut, setSelectedCheckOut] = useState("Double");
    const [selectedNumLegs, setSelectedNumLegs] = useState(1);
    const [selectedNumSets, setSelectedNumSets] = useState(1);
    const [randomFirstPlayer, setRandomFirstPlayer] = useState(true);
    const [error, setError] = useState("");

    const OnStartPress = () => {
        console.log(
            "players: ",
            players,
            "type",
            selectedGameType,
            "checkin",
            selectedCheckIn,
            "checkout",
            selectedCheckOut,
            "legs",
            selectedNumLegs,
            "sets",
            selectedNumSets,
            "randomFirstPlayer",
            randomFirstPlayer,
        );
    };

    useEffect(() => {
        const loadData = async () => {
            setGameTypes(GameTypeRepository.getAll());
            const data = await getPlayers();
            setPlayers(data);
        };
        loadData();
    }, []);

    const gameTypeOptions = gameTypes.map((g) => ({
        label: g.name,
        value: g.id,
    }));

    const checkOptions = ["Straight", "Double", "Master", "Tous"];
    const legsOptions = [1, 3, 5, 7];
    const setsOptions = [1, 3, 5];

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
                        <Pressable
                            onPress={() => {
                                const validationError =
                                    validateGame(selectedPlayers);
                                if (validationError) {
                                    setError(validationError);
                                    return;
                                }
                                OnStartPress();
                            }}
                        >
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
