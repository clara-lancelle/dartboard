// src/repositories/GameTypeRepository.js

const GAME_TYPES = [
    {
        id: 1,
        name: "X01",
        modeCategory: "score",
        description: "Descendre de 301 / 501 à 0",
        defaultParams: {
            startingScore: 501,
            doubleOut: false,
        },
    },
    {
        id: 2,
        name: "Cricket",
        modeCategory: "marks",
        variant: "classic",
        description: "Fermer 15-20 + Bull et marquer des points",
        defaultParams: {},
    },
    {
        id: 3,
        name: "Cricket Cut Throat",
        modeCategory: "marks",
        variant: "cutthroat",
        description: "Fermer 15-20 + Bull et donner des points aux autres",
        defaultParams: {},
    },
    {
        id: 4,
        name: "Around the Clock",
        modeCategory: "progression",
        description: "Toucher les numéros dans l'ordre",
        defaultParams: {
            maxNumber: 20,
        },
    },
    {
        id: 5,
        name: "Killer",
        modeCategory: "lives",
        description: "Éliminer les adversaires",
        defaultParams: {
            lives: 3,
        },
    },
];

export default {
    getAll() {
        return GAME_TYPES;
    },

    getById(id) {
        return GAME_TYPES.find((g) => g.id === id);
    },
};
