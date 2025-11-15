import { SQLiteDatabase } from "expo-sqlite";

export const initDatabase = async (db: SQLiteDatabase) => {
    try {
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS movies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        year INTEGER,
        created_at INTEGER
      )
    `);

        const existing = await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) as count FROM movies`
        );

        if (existing && existing.count === 0) {
            await db.runAsync(
                `INSERT INTO movies (title, year, created_at) VALUES (?, ?, ?)`,
                ["Inception", 2010, Date.now()]
            );
            await db.runAsync(
                `INSERT INTO movies (title, year, created_at) VALUES (?, ?, ?)`,
                ["Interstellar", 2014, Date.now()]
            );
            await db.runAsync(
                `INSERT INTO movies (title, year, created_at) VALUES (?, ?, ?)`,
                ["The Matrix", 1999, Date.now()]
            );
        }

        console.log("Database initialized successfully");
    } catch (error) {
        console.error("Error initializing database:", error);
        throw error;
    }
};
