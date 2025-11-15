import { SQLiteDatabase } from "expo-sqlite";

export const initDatabase = async (db: SQLiteDatabase) => {
    try {
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS movies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        year INTEGER,
        watched INTEGER DEFAULT 0,
        rating INTEGER,
        created_at INTEGER
      )
    `);

        const tableInfo = await db.getAllAsync(
            `PRAGMA table_info(movies)`
        );

        const hasWatched = tableInfo.some((col: any) => col.name === 'watched');
        const hasRating = tableInfo.some((col: any) => col.name === 'rating');

        if (!hasWatched) {
            await db.execAsync(`ALTER TABLE movies ADD COLUMN watched INTEGER DEFAULT 0`);
        }

        if (!hasRating) {
            await db.execAsync(`ALTER TABLE movies ADD COLUMN rating INTEGER`);
        }

        const existing = await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) as count FROM movies`
        );

        if (existing && existing.count === 0) {
            await db.runAsync(
                `INSERT INTO movies (title, year, watched, rating, created_at) VALUES (?, ?, ?, ?, ?)`,
                ["Inception", 2010, 1, 5, Date.now()]
            );
            await db.runAsync(
                `INSERT INTO movies (title, year, watched, rating, created_at) VALUES (?, ?, ?, ?, ?)`,
                ["Interstellar", 2014, 1, 4, Date.now()]
            );
            await db.runAsync(
                `INSERT INTO movies (title, year, watched, rating, created_at) VALUES (?, ?, ?, ?, ?)`,
                ["The Matrix", 1999, 0, null, Date.now()]
            );
        }

        console.log("Database initialized successfully");
    } catch (error) {
        console.error("Error initializing database:", error);
        throw error;
    }
};

export const createMovie = async (
    db: SQLiteDatabase,
    data: { title: string; year?: number; rating?: number }
) => {
    await db.runAsync(
        `INSERT INTO movies (title, year, watched, rating, created_at) VALUES (?, ?, ?, ?, ?)`,
        [data.title, data.year || null, 0, data.rating || null, Date.now()]
    );
};

export const toggleWatched = async (db: SQLiteDatabase, id: number) => {
    const movie = await db.getFirstAsync<{ watched: number }>(
        `SELECT watched FROM movies WHERE id = ?`,
        [id]
    );
    if (movie) {
        await db.runAsync(
            `UPDATE movies SET watched = ? WHERE id = ?`,
            [movie.watched === 1 ? 0 : 1, id]
        );
    }
};

export const updateMovie = async (
    db: SQLiteDatabase,
    id: number,
    data: { title: string; year?: number; rating?: number }
) => {
    await db.runAsync(
        `UPDATE movies SET title = ?, year = ?, rating = ? WHERE id = ?`,
        [data.title, data.year || null, data.rating || null, id]
    );
};

export const deleteMovie = async (db: SQLiteDatabase, id: number) => {
    await db.runAsync(`DELETE FROM movies WHERE id = ?`, [id]);
};

export const checkMovieExists = async (
    db: SQLiteDatabase,
    title: string,
    year: number | null
): Promise<boolean> => {
    if (year !== null) {
        const existing = await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) as count FROM movies WHERE title = ? AND year = ?`,
            [title, year]
        );
        return existing ? existing.count > 0 : false;
    } else {
        const existing = await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) as count FROM movies WHERE title = ? AND year IS NULL`,
            [title]
        );
        return existing ? existing.count > 0 : false;
    }
};

export const importMovies = async (
    db: SQLiteDatabase,
    movies: Array<{ title: string; year?: number; rating?: number }>
): Promise<{ imported: number; skipped: number }> => {
    let imported = 0;
    let skipped = 0;

    for (const movie of movies) {
        const exists = await checkMovieExists(db, movie.title, movie.year || null);
        if (exists) {
            skipped++;
            continue;
        }

        await db.runAsync(
            `INSERT INTO movies (title, year, watched, rating, created_at) VALUES (?, ?, ?, ?, ?)`,
            [
                movie.title,
                movie.year || null,
                0,
                movie.rating || null,
                Date.now(),
            ]
        );
        imported++;
    }

    return { imported, skipped };
};
