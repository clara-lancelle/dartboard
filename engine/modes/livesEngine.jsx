export const playLivesMode = ({ gameType, player, input, state }) => {
    const { number } = input;

    const target = state.targets[player.id];

    if (number !== target) return {};

    if (!state.isKiller[player.id]) {
        const progress = (state.progress[player.id] || 0) + 1;

        if (progress >= 3) {
            return { isKiller: true };
        }

        return { progress };
    }

    // attaque
    const victim = state.playerByTarget[number];
    if (!victim) return {};

    const remainingLives = state.lives[victim] - 1;

    if (remainingLives <= 0) {
        return { eliminated: victim };
    }

    return {
        victim,
        remainingLives,
    };
};
