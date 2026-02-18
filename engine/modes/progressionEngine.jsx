export const playProgressionMode = ({ gameType, player, input, state }) => {
    const target = state.targets[player.id];
    const max = gameType.defaultParams.maxNumber;

    if (input.number === target) {
        if (target === max) {
            return { isWin: true };
        }

        return { newTarget: target + 1 };
    }

    return {};
};
