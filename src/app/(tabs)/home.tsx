import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Card, FAB, Icon } from "react-native-paper";
import MovieModal from "@/components/MovieModal";
import { createMovie, toggleWatched } from "@/db";

type Movie = {
  id: number;
  title: string;
  year: number | null;
  watched: number;
  rating: number | null;
  created_at: number;
};

const HomeScreen = () => {
  const db = useSQLiteContext();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
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
  };

  const handleAddMovie = async (data: {
    title: string;
    year?: number;
    rating?: number;
  }) => {
    try {
      await createMovie(db, data);
      await loadMovies();
    } catch (error) {
      console.error("Error adding movie:", error);
    }
  };

  const handleToggleWatched = async (id: number) => {
    try {
      await toggleWatched(db, id);
      await loadMovies();
    } catch (error) {
      console.error("Error toggling watched:", error);
    }
  };

  const renderMovieItem = ({ item }: { item: Movie }) => {
    const isWatched = item.watched === 1;
    
    return (
      <TouchableOpacity
        onPress={() => handleToggleWatched(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.movieItem}>
          <Card style={[styles.card, isWatched && styles.cardWatched]}>
            <Card.Content>
              <View style={styles.titleRow}>
                <Text style={[styles.title, isWatched && styles.titleWatched]}>
                  {item.title}
                </Text>
                {isWatched && (
                  <Icon source="check-circle" size={24} color="#4CAF50" />
                )}
              </View>
              {item.year && (
                <Text style={[styles.info, isWatched && styles.infoWatched]}>
                  Year: {item.year}
                </Text>
              )}
              <Text style={[styles.info, isWatched && styles.infoWatched]}>
                Watched: {isWatched ? "Yes" : "No"}
              </Text>
              {item.rating && (
                <Text style={[styles.info, isWatched && styles.infoWatched]}>
                  Rating: {item.rating}/5
                </Text>
              )}
            </Card.Content>
          </Card>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Movies List</Text>
      {movies.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có phim nào.</Text>
        </View>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMovieItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      />

      <MovieModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleAddMovie}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 20,
  },
  movieItem: {
    marginBottom: 12,
  },
  card: {
    elevation: 2,
  },
  cardWatched: {
    opacity: 0.7,
    backgroundColor: "#f0f0f0",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  titleWatched: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  info: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  infoWatched: {
    color: "#999",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen;
