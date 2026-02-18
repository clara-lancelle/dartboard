export const playScoreMode = ({ game, player, input, state }) => {
    const currentScore = state.scores[player.id];
    const newScore = currentScore - input.totalScore;

    if (newScore < 0 || newScore === 1) {
        return { isBust: true };
    }

    if (newScore === 0) {
        if (game.checkOut === "DOUBLE" && !input.lastDartWasDouble) {
            return { isBust: true };
        }

        return {
            isWin: true,
            newScore: 0,
        };
    }

    return {
        newScore,
    };
};
