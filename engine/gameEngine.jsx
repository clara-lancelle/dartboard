import { playLivesMode } from "./modes/livesEngine";
import { playMarksMode } from "./modes/marksEngine";
import { playProgressionMode } from "./modes/progressionEngine";
import { playScoreMode } from "./modes/scoreEngine";

export const playTurn = async ({ game, gameType, player, input, state }) => {
    switch (gameType.modeCategory) {
        case "score":
            return playScoreMode({ game, player, input, state });

        case "marks":
            return playMarksMode({ gameType, player, input, state });

        case "progression":
            return playProgressionMode({ gameType, player, input, state });

        case "lives":
            return playLivesMode({ gameType, player, input, state });

        default:
            throw new Error("Mode inconnu");
    }
};
