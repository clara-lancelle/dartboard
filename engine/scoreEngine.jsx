export const calculate501 = ({ currentScore, turnScore, checkOut }) => {
    const newScore = currentScore - turnScore;

    if (newScore < 0) {
        return { isBust: true, newScore: currentScore };
    }

    if (newScore === 1) {
        return { isBust: true, newScore: currentScore };
    }

    if (newScore === 0) {
        if (checkOut === "DOUBLE") {
            // validation du dernier dart à gérer
            return { isWin: true, newScore: 0 };
        }

        return { isWin: true, newScore: 0 };
    }

    return { newScore };
};
