import { useEffect, useState } from "react";
import { View } from "react-native";
import HeroButton from "../../components/HeroButton";
import PlayerList from "../../components/PlayerList";
import PlayerForm from "../../forms/PlayerForm";
import {
    createPlayer,
    deletePlayer,
    getPlayers,
    updatePlayer,
} from "../../repositories/PlayerRepository";

export default function PlayersScreen() {
    const [showForm, setShowForm] = useState(false);
    const [players, setPlayers] = useState([]);
    const [refresh, setRefresh] = useState(false); // trigger reload

    // Fonction pour charger les joueurs
    const loadPlayers = async () => {
        try {
            const data = await getPlayers();
            setPlayers(data);
            console.log(players);
        } catch (error) {
            console.error("Error while listing players:", error);
        }
    };

    // Handle création d'un joueur
    const handleCreate = async (playerName, avatar) => {
        try {
            await createPlayer({ name: playerName, avatar });
            setShowForm(false);
            alert("Joueur ajouté !");
            setRefresh((prev) => !prev); // trigger reload
        } catch (error) {
            console.error("Error while creating player:", error);
        }
    };

    const handleUpdate = async (id, { name: playerName, avatar }) => {
        try {
            await updatePlayer(id, { name: playerName, avatar });
            alert("Joueur modifié !");
            setRefresh((prev) => !prev); // trigger reload
        } catch (error) {
            console.error("Error while updating player:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            console.log(id);
            await deletePlayer(id);
            alert("Joueur supprimé !");
            setRefresh((prev) => !prev); // trigger reload
            loadPlayers();
        } catch (error) {
            console.error("Error while deleting player:", error);
        }
    };

    useEffect(() => {
        loadPlayers();
    }, [refresh]);
    return (
        <View className="flex-1 items-center justify-center bg-gray-100">
            <HeroButton
                text="Ajouter un joueur"
                icon="add"
                bg="green"
                onPress={() => setShowForm(true)}
            />
            {showForm && <PlayerForm onSubmit={handleCreate} />}
            {!showForm && (
                <PlayerList
                    players={players}
                    onUpdatePress={handleUpdate}
                    onDeletePress={handleDelete}
                />
            )}
        </View>
    );
}
