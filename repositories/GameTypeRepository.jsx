// src/repositories/GameTypeRepository.js

import { db } from "../database/db";

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

//
// READ - depuis la config JS
//
export const getAllGameTypes = () => {
    return GAME_TYPES;
};

export const getGameTypeById = (id) => {
    return GAME_TYPES.find((g) => g.id === id);
};

//
// Sync automatique DB (sécurité si reset DB)
//
export const syncGameTypesWithDB = async () => {
    for (const type of GAME_TYPES) {
        await db.runAsync(
            `
      INSERT OR IGNORE INTO game_types (id, name)
      VALUES (?, ?)
      `,
            [type.id, type.name],
        );
    }
};
