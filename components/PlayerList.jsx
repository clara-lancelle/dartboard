import { useState } from "react";
import { ImageBackground, Pressable, Text, View } from "react-native";
import dismissIcon from "../assets/icons/annuler.png";
import editIcon from "../assets/icons/editer.png";
import binIcon from "../assets/icons/supprimer.png";
import validateIcon from "../assets/icons/verifie.png";

import { TextInput } from "react-native";
import AvatarSelector from "../forms/AvatarSelector";
import { validatePlayer } from "../validations/ValidatePlayer";
import AvatarComponent from "./AvatarComponent";
import IconButton from "./IconButton";

const avatarImages = {
    avatar1: require("../assets/avatars/avatar1.png"),
    avatar2: require("../assets/avatars/avatar2.png"),
    avatar3: require("../assets/avatars/avatar3.png"),
    avatar4: require("../assets/avatars/avatar4.png"),
    avatar5: require("../assets/avatars/avatar5.png"),
    avatar6: require("../assets/avatars/avatar6.png"),
    avatar7: require("../assets/avatars/avatar7.png"),
    avatar8: require("../assets/avatars/avatar8.png"),
    avatar9: require("../assets/avatars/avatar9.png"),
    avatar10: require("../assets/avatars/avatar10.png"),
    avatar11: require("../assets/avatars/avatar11.png"),
    avatar12: require("../assets/avatars/avatar12.png"),
};

export default function PlayerList({ players, onUpdatePress, onDeletePress }) {
    const [showUpdateImageSelect, setShowImageSelect] = useState(false);
    const [updatedName, setUpdatedName] = useState("");
    const [updatedImage, setUpdatedImage] = useState("");
    const [editingPlayerId, setEditingPlayerId] = useState(null);
    const [error, setError] = useState("");

    return (
        <View className="gap-5 w-11/12 mt-5">
            {players.length > 0 &&
                players.map(
                    ({ avatar, name, id, created_at_formatted, ...rest }) =>
                        (editingPlayerId !== id ? (
                            <View
                                key={id}
                                className="h-20 bg-white w-full items-center rounded-xl flex justify-between flex-row gap-4"
                            >
                                <View className="flex-row items-center gap-4 px-4">
                                    <AvatarComponent
                                        avatar={avatar}
                                        width="55"
                                    />
                                    <View>
                                        <Text className="text-lg font-semibold">
                                            {name}
                                        </Text>
                                        <Text className="text-sm text-gray-400">
                                            Créé le : {created_at_formatted}
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex flex-row gap-5 px-4">
                                    <IconButton
                                        onBtnPress={() =>
                                            setEditingPlayerId(id)
                                        }
                                        iconPath={editIcon}
                                        alt="Modifier le joueur"
                                    />
                                    <IconButton
                                        onBtnPress={() => onDeletePress(id)}
                                        iconPath={binIcon}
                                        alt="Supprimer le joueur"
                                    />
                                </View>
                            </View>
                        ) : (
                            <>
                                <View
                                    key={id}
                                    className="h-20 bg-white w-full items-center rounded-xl flex justify-between flex-row gap-4"
                                >
                                    <View className="flex-row items-center gap-4 px-4">
                                        <ImageBackground
                                            source={avatarImages[avatar]}
                                            style={{ width: 50, height: 50 }}
                                            contentFit="cover"
                                        >
                                            <Pressable
                                                onPress={() =>
                                                    setShowImageSelect(true)
                                                }
                                                style={{
                                                    width: 35,
                                                    height: 35,
                                                }}
                                                className=" rounded-full"
                                            ></Pressable>
                                        </ImageBackground>

                                        <View>
                                            <TextInput
                                                value={updatedName}
                                                onChangeText={setUpdatedName}
                                                className="bg-gray-200 px-3 py-2 rounded-xl"
                                                placeholder={name}
                                            />
                                            <Text className="text-sm text-gray-400">
                                                Créé le : {created_at_formatted}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="flex flex-row gap-5 px-4">
                                        <IconButton
                                            onBtnPress={() => {
                                                const validationError =
                                                    validatePlayer(
                                                        updatedName,
                                                        { required: false },
                                                    );

                                                if (validationError) {
                                                    setError(validationError);
                                                    return;
                                                }
                                                onUpdatePress(id, {
                                                    name: updatedName || name,
                                                    avatar:
                                                        updatedImage || avatar,
                                                });
                                                setEditingPlayerId(null);
                                                setUpdatedName("");
                                                setUpdatedImage("");
                                                setError("");
                                            }}
                                            iconPath={validateIcon}
                                            alt="Valider les modifications"
                                        />
                                        <IconButton
                                            onBtnPress={() => {
                                                setEditingPlayerId(null);
                                                setUpdatedName("");
                                                setUpdatedImage("");
                                            }}
                                            iconPath={dismissIcon}
                                            alt="Annuler les modifications"
                                        />
                                    </View>
                                </View>
                                {error ? (
                                    <Text className="text-red-500 text-xs self-center">
                                        {error}
                                    </Text>
                                ) : null}
                                {showUpdateImageSelect && (
                                    <View
                                        key={`selector-${id}`}
                                        className="bg-white "
                                    >
                                        <AvatarSelector
                                            selected={updatedImage || avatar}
                                            onSelect={setUpdatedImage}
                                        />
                                    </View>
                                )}
                            </>
                        )) || <Text>Pas encore de joueurs ajoutés.</Text>,
                )}
        </View>
    );
}
