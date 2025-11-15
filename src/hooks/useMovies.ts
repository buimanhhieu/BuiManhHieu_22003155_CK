import { useState, useEffect, useCallback } from "react";
import { useSQLiteContext } from "expo-sqlite";
import {
  createMovie,
  toggleWatched,
  updateMovie,
  deleteMovie,
  importMovies,
} from "@/db";

type Movie = {
  id: number;
  title: string;
  year: number | null;
  watched: number;
  rating: number | null;
  created_at: number;
};

type SortOption = "created_at" | "year" | "title";

export const useMovies = () => {
  const db = useSQLiteContext();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("created_at");

  const loadMovies = useCallback(async () => {
    try {
      const data = await db.getAllAsync<Movie>(
        "SELECT * FROM movies ORDER BY created_at DESC"
      );
      setMovies(data);
    } catch (error) {
      console.error("Error loading movies:", error);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  const addMovie = useCallback(
    async (data: { title: string; year?: number; rating?: number }) => {
      try {
        await createMovie(db, data);
        await loadMovies();
      } catch (error) {
        console.error("Error adding movie:", error);
        throw error;
      }
    },
    [db, loadMovies]
  );

  const editMovie = useCallback(
    async (
      id: number,
      data: { title: string; year?: number; rating?: number }
    ) => {
      try {
        await updateMovie(db, id, data);
        await loadMovies();
      } catch (error) {
        console.error("Error editing movie:", error);
        throw error;
      }
    },
    [db, loadMovies]
  );

  const removeMovie = useCallback(
    async (id: number) => {
      try {
        await deleteMovie(db, id);
        await loadMovies();
      } catch (error) {
        console.error("Error deleting movie:", error);
        throw error;
      }
    },
    [db, loadMovies]
  );

  const toggleMovieWatched = useCallback(
    async (id: number) => {
      try {
        await toggleWatched(db, id);
        await loadMovies();
      } catch (error) {
        console.error("Error toggling watched:", error);
        throw error;
      }
    },
    [db, loadMovies]
  );

  const importFromAPI = useCallback(
    async (apiUrl: string) => {
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("API response must be an array");
        }

        const moviesToImport = data
          .map((item: any) => ({
            title: item.title || item.name || "",
            year: item.year ? parseInt(item.year) : undefined,
            rating: item.rating ? parseInt(item.rating) : undefined,
          }))
          .filter((movie: any) => movie.title.trim() !== "");

        if (moviesToImport.length === 0) {
          throw new Error("Không có phim hợp lệ trong API response");
        }

        const result = await importMovies(db, moviesToImport);
        await loadMovies();

        return result;
      } catch (error: any) {
        console.error("Error importing from API:", error);
        throw new Error(error.message || "Không thể import phim từ API");
      }
    },
    [db, loadMovies]
  );

  const sortedMovies = useCallback(
    (moviesList: Movie[], sortOption: SortOption): Movie[] => {
      const sorted = [...moviesList];
      switch (sortOption) {
        case "year":
          return sorted.sort((a, b) => {
            if (a.year === null && b.year === null) return 0;
            if (a.year === null) return 1;
            if (b.year === null) return -1;
            return b.year - a.year;
          });
        case "title":
          return sorted.sort((a, b) =>
            a.title.localeCompare(b.title, "vi")
          );
        case "created_at":
        default:
          return sorted.sort((a, b) => b.created_at - a.created_at);
      }
    },
    []
  );

  return {
    movies,
    loading,
    sortBy,
    setSortBy,
    loadMovies,
    addMovie,
    editMovie,
    removeMovie,
    toggleMovieWatched,
    importFromAPI,
    sortedMovies,
  };
};


