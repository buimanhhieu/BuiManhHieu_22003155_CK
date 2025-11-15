import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Card, FAB, Icon } from "react-native-paper";
import MovieModal from "@/components/MovieModal";
import { createMovie, toggleWatched, updateMovie, deleteMovie } from "@/db";

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
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

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

  const handleEditMovie = async (data: {
    title: string;
    year?: number;
    rating?: number;
  }) => {
    if (!editingMovie) return;
    try {
      await updateMovie(db, editingMovie.id, data);
      await loadMovies();
      setEditingMovie(null);
    } catch (error) {
      console.error("Error editing movie:", error);
    }
  };

  const handleSaveMovie = async (data: {
    title: string;
    year?: number;
    rating?: number;
  }) => {
    if (editingMovie) {
      await handleEditMovie(data);
    } else {
      await handleAddMovie(data);
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

  const handleDeleteMovie = (id: number, title: string) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa phim "${title}"?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMovie(db, id);
              await loadMovies();
            } catch (error) {
              console.error("Error deleting movie:", error);
              Alert.alert("Lỗi", "Không thể xóa phim. Vui lòng thử lại.");
            }
          },
        },
      ]
    );
  };

  const renderMovieItem = ({ item }: { item: Movie }) => {
    const isWatched = item.watched === 1;
    
    return (
      <View style={styles.movieItem}>
        <Card style={[styles.card, isWatched && styles.cardWatched]}>
          <Card.Content>
            <View style={styles.titleRow}>
              <Text style={[styles.title, isWatched && styles.titleWatched]}>
                {item.title}
              </Text>
              <View style={styles.actionRow}>
                {isWatched && (
                  <Icon source="check-circle" size={24} color="#4CAF50" />
                )}
                <TouchableOpacity
                  onPress={() => {
                    setEditingMovie(item);
                    setModalVisible(true);
                  }}
                  style={styles.editButton}
                >
                  <Icon source="pencil" size={20} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteMovie(item.id, item.title)}
                  style={styles.deleteButton}
                >
                  <Icon source="delete" size={20} color="#f44336" />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => handleToggleWatched(item.id)}
              activeOpacity={0.7}
            >
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
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </View>
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
        onPress={() => {
          setEditingMovie(null);
          setModalVisible(true);
        }}
      />

      <MovieModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingMovie(null);
        }}
        onSave={handleSaveMovie}
        movie={editingMovie}
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
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
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
