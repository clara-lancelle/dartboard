export function validateGame(players) {
    if (players.length === 0) {
        return "Vous devez ajouter au moins 1 joueur.";
    }

    return null;
}
