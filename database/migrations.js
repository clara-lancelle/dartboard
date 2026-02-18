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
        created_at TEXT NOT NULL,
        ended_at TEXT,
        legsNumber INTEGER NOT NULL,
        setsNumber INTEGER NOT NULL,
        gameTypeId INTEGER NOT NULL,
        winnerId INTEGER,
        checkIn TEXT NOT NULL,
        checkOut TEXT NOT NULL,
        startingScore INTEGER,
        FOREIGN KEY (gameTypeId) REFERENCES game_types(id),
        FOREIGN KEY (winnerId) REFERENCES players(id)
      );
    `,
    },

    {
        version: 2,
        up: `
      
      ALTER TABLE game_types ADD COLUMN modeCategory TEXT;

      CREATE TABLE IF NOT EXISTS player_game (
        id INTEGER PRIMARY KEY NOT NULL,
        gameId INTEGER NOT NULL,
        playerId INTEGER NOT NULL,
        turnOrder INTEGER NOT NULL,
        FOREIGN KEY (gameId) REFERENCES games(id),
        FOREIGN KEY (playerId) REFERENCES players(id)
      );

      CREATE TABLE IF NOT EXISTS sets (
        id INTEGER PRIMARY KEY NOT NULL,
        gameId INTEGER NOT NULL,
        isOver INTEGER NOT NULL DEFAULT 0,
        winnerId INTEGER,
        created_at TEXT NOT NULL,
        FOREIGN KEY (gameId) REFERENCES games(id),
        FOREIGN KEY (winnerId) REFERENCES players(id)
      );

      CREATE TABLE IF NOT EXISTS legs (
        id INTEGER PRIMARY KEY NOT NULL,
        setId INTEGER NOT NULL,
        isOver INTEGER NOT NULL DEFAULT 0,
        winnerId INTEGER,
        created_at TEXT NOT NULL,
        FOREIGN KEY (setId) REFERENCES sets(id),
        FOREIGN KEY (winnerId) REFERENCES players(id)
      );

      CREATE TABLE IF NOT EXISTS turns (
        id INTEGER PRIMARY KEY NOT NULL,
        legId INTEGER NOT NULL,
        playerId INTEGER NOT NULL,
        turnNumber INTEGER NOT NULL,
        totalScore INTEGER NOT NULL,
        isBust INTEGER NOT NULL DEFAULT 0,
        remainingScoreAfter INTEGER,
        created_at TEXT NOT NULL,
        FOREIGN KEY (legId) REFERENCES legs(id),
        FOREIGN KEY (playerId) REFERENCES players(id)
      );

      CREATE TABLE IF NOT EXISTS darts (
        id INTEGER PRIMARY KEY NOT NULL,
        turnId INTEGER NOT NULL,
        segment INTEGER,
        multiplier INTEGER NOT NULL,
        score INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (turnId) REFERENCES turns(id)
      );

      CREATE TABLE IF NOT EXISTS cricket_marks (
        id INTEGER PRIMARY KEY NOT NULL,
        legId INTEGER NOT NULL,
        playerId INTEGER NOT NULL,
        number INTEGER NOT NULL,
        hits INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (legId) REFERENCES legs(id),
        FOREIGN KEY (playerId) REFERENCES players(id)
      );

      CREATE TABLE IF NOT EXISTS player_progress (
        id INTEGER PRIMARY KEY NOT NULL,
        legId INTEGER NOT NULL,
        playerId INTEGER NOT NULL,
        currentTarget INTEGER NOT NULL,
        FOREIGN KEY (legId) REFERENCES legs(id),
        FOREIGN KEY (playerId) REFERENCES players(id)
      );

      CREATE TABLE IF NOT EXISTS killer_state (
        id INTEGER PRIMARY KEY NOT NULL,
        legId INTEGER NOT NULL,
        playerId INTEGER NOT NULL,
        targetNumber INTEGER NOT NULL,
        livesRemaining INTEGER NOT NULL,
        FOREIGN KEY (legId) REFERENCES legs(id),
        FOREIGN KEY (playerId) REFERENCES players(id)
      );

      CREATE TABLE IF NOT EXISTS game_settings (
        id INTEGER PRIMARY KEY NOT NULL,
        gameId INTEGER NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        FOREIGN KEY (gameId) REFERENCES games(id)
      );
      CREATE INDEX IF NOT EXISTS idx_turns_playerId ON turns(playerId);
      CREATE INDEX IF NOT EXISTS idx_darts_turnId ON darts(turnId);
      CREATE INDEX IF NOT EXISTS idx_cricket_marks_playerId ON cricket_marks(playerId);
      CREATE INDEX IF NOT EXISTS idx_games_gameTypeId ON games(gameTypeId);

    `,
    },
    {
        version: 3,
        up: `
    INSERT OR IGNORE INTO game_types (id, name) VALUES (1, 'X01');
    INSERT OR IGNORE INTO game_types (id, name) VALUES (2, 'Cricket');
    INSERT OR IGNORE INTO game_types (id, name) VALUES (3, 'Cricket Cut Throat');
    INSERT OR IGNORE INTO game_types (id, name) VALUES (4, 'Around the Clock');
    INSERT OR IGNORE INTO game_types (id, name) VALUES (5, 'Killer');
  `,
    },
];
