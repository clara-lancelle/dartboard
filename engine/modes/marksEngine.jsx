export const playMarksMode = ({ gameType, player, input, state }) => {
    const { number, hits } = input;

    const allowed = [15, 16, 17, 18, 19, 20, 25];
    if (!allowed.includes(number)) return {};

    const playerMarks = state.marks[player.id] || {};
    const newHits = Math.min((playerMarks[number] || 0) + hits, 3);

    let scoreDelta = 0;

    if (newHits >= 3) {
        const overflow = (playerMarks[number] || 0) + hits - 3;

        state.players.forEach((p) => {
            if (p.id !== player.id) {
                const opponentMarks = state.marks[p.id] || {};
                if ((opponentMarks[number] || 0) < 3) {
                    if (gameType.variant === "classic") {
                        scoreDelta += overflow * number;
                    }

                    if (gameType.variant === "cutthroat") {
                        state.scores[p.id] += overflow * number;
                    }
                }
            }
        });
    }

    return {
        updatedMarks: {
            ...playerMarks,
            [number]: newHits,
        },
        scoreDelta,
    };
};
