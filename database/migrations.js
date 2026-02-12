export const migrations = [
    {
        version: 1,
        up: `
      CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        avatar TEXT NOT NULL,
        created_at TEXT NOT NULL,
        deleted_at TEXT
      );

      CREATE TABLE IF NOT EXISTS game_types (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY NOT NULL,
        date_start TEXT NOT NULL,
        date_end TEXT,
        legsNumber INTEGER NOT NULL,
        setsNumber INTEGER NOT NULL,
        gameTypeId TEXT NOT NULL,
        winnerId INTEGER,
        checkIn TEXT NOT NULL,
        checkOut TEXT NOT NULL,
        FOREIGN KEY (gameTypeId) REFERENCES game_types(id),
        FOREIGN KEY (winnerId) REFERENCES players(id)
      );
    `,
    },
];
