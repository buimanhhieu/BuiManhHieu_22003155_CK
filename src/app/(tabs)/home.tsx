import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { Card, FAB, Icon, TextInput, SegmentedButtons, Button, Chip } from "react-native-paper";
import MovieModal from "@/components/MovieModal";
import ImportAPIModal from "@/components/ImportAPIModal";
import { useMovies } from "@/hooks/useMovies";
import { colors } from "@/theme/colors";

type Movie = {
  id: number;
  title: string;
  year: number | null;
  watched: number;
  rating: number | null;
  created_at: number;
};

const HomeScreen = () => {
  const {
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
  } = useMovies();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [watchedFilter, setWatchedFilter] = useState<string>("all");
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleSaveMovie = useCallback(
    async (data: { title: string; year?: number; rating?: number }) => {
      try {
        if (editingMovie) {
          await editMovie(editingMovie.id, data);
          setEditingMovie(null);
        } else {
          await addMovie(data);
        }
      } catch (error) {
        console.error("Error saving movie:", error);
      }
    },
    [editingMovie, editMovie, addMovie]
  );

  const handleDeleteMovie = useCallback(
    (id: number, title: string) => {
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
                await removeMovie(id);
              } catch (error) {
                Alert.alert("Lỗi", "Không thể xóa phim. Vui lòng thử lại.");
              }
            },
          },
        ]
      );
    },
    [removeMovie]
  );

  const handleImportFromAPI = useCallback(
    async (apiUrl: string) => {
      try {
        const result = await importFromAPI(apiUrl);
        Alert.alert(
          "Import thành công",
          `Đã import ${result.imported} phim mới.\nBỏ qua ${result.skipped} phim trùng lặp.`
        );
      } catch (error: any) {
        throw error;
      }
    },
    [importFromAPI]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMovies();
    setRefreshing(false);
  }, [loadMovies]);

  const filteredMovies = useMemo(() => {
    let filtered = movies;

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((movie) =>
        movie.title.toLowerCase().includes(query)
      );
    }

    if (watchedFilter === "watched") {
      filtered = filtered.filter((movie) => movie.watched === 1);
    } else if (watchedFilter === "unwatched") {
      filtered = filtered.filter((movie) => movie.watched === 0);
    }

    return sortedMovies(filtered, sortBy);
  }, [movies, searchQuery, watchedFilter, sortBy, sortedMovies]);

  const renderMovieItem = ({ item }: { item: Movie }) => {
    const isWatched = item.watched === 1;

    return (
      <View style={styles.movieItem}>
        <Card style={[styles.card, isWatched && styles.cardWatched]}>
          <View style={styles.cardLine} />
          <Card.Content style={styles.cardContent}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, isWatched && styles.titleWatched]}>
                {item.title}
              </Text>
              <View style={styles.actionRow}>
                {isWatched && (
                  <Icon source="check-circle" size={24} color={colors.success} />
                )}
                <TouchableOpacity
                  onPress={() => {
                    setEditingMovie(item);
                    setModalVisible(true);
                  }}
                  style={styles.editButton}
                >
                  <Icon source="pencil" size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteMovie(item.id, item.title)}
                  style={styles.deleteButton}
                >
                  <Icon source="delete" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => toggleMovieWatched(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.infoRow}>
                {item.year && (
                  <View style={styles.infoItem}>
                    <Icon source="calendar" size={16} color={colors.textSecondary} />
                    <Text style={[styles.info, isWatched && styles.infoWatched]}>
                      {item.year}
                    </Text>
                  </View>
                )}
                <View style={styles.infoItem}>
                  <Icon
                    source={isWatched ? "eye" : "eye-off"}
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.info, isWatched && styles.infoWatched]}>
                    {isWatched ? "Đã xem" : "Chưa xem"}
                  </Text>
                </View>
                {item.rating && (
                  <View style={styles.infoItem}>
                    <Icon source="star" size={16} color={colors.primary} />
                    <Text style={[styles.info, isWatched && styles.infoWatched]}>
                      {item.rating}/5
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyCard}>
        <Icon source="movie-off" size={64} color={colors.textLight} />
        <Text style={styles.emptyTitle}>
          {movies.length === 0
            ? "Chưa có phim nào"
            : "Không tìm thấy phim nào"}
        </Text>
        <Text style={styles.emptySubtitle}>
          {movies.length === 0
            ? "Nhấn nút + để thêm phim mới"
            : "Thử tìm kiếm với từ khóa khác"}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Icon source="loading" size={48} color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Danh sách phim</Text>
        <View style={styles.sortContainer}>
          <Chip
            selected={sortBy === "created_at"}
            onPress={() => setSortBy("created_at")}
            style={styles.sortChip}
            selectedColor={colors.primary}
          >
            Mới nhất
          </Chip>
          <Chip
            selected={sortBy === "year"}
            onPress={() => setSortBy("year")}
            style={styles.sortChip}
            selectedColor={colors.primary}
          >
            Năm
          </Chip>
          <Chip
            selected={sortBy === "title"}
            onPress={() => setSortBy("title")}
            style={styles.sortChip}
            selectedColor={colors.primary}
          >
            Tên
          </Chip>
        </View>
      </View>

      <View style={styles.searchSection}>
        <TextInput
          label="Tìm kiếm phim"
          value={searchQuery}
          onChangeText={setSearchQuery}
          mode="outlined"
          left={<TextInput.Icon icon="magnify" />}
          style={styles.searchInput}
          theme={{
            colors: {
              primary: colors.primary,
              outline: colors.border,
            },
          }}
        />

        <SegmentedButtons
          value={watchedFilter}
          onValueChange={setWatchedFilter}
          buttons={[
            { value: "all", label: "Tất cả" },
            { value: "watched", label: "Đã xem" },
            { value: "unwatched", label: "Chưa xem" },
          ]}
          style={styles.filterButtons}
        />

        <Button
          mode="outlined"
          icon="download"
          onPress={() => setImportModalVisible(true)}
          style={styles.importButton}
          textColor={colors.primary}
          buttonColor={colors.paper}
        >
          Import từ API
        </Button>
      </View>

      {filteredMovies.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredMovies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMovieItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          setEditingMovie(null);
          setModalVisible(true);
        }}
        color={colors.surface}
        customSize={56}
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

      <ImportAPIModal
        visible={importModalVisible}
        onClose={() => setImportModalVisible(false)}
        onImport={handleImportFromAPI}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    backgroundColor: colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  sortContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  sortChip: {
    backgroundColor: colors.paper,
    borderColor: colors.border,
  },
  searchSection: {
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    marginBottom: 12,
    backgroundColor: colors.paper,
  },
  filterButtons: {
    marginBottom: 12,
  },
  importButton: {
    marginTop: 4,
    borderColor: colors.primary,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  movieItem: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.paper,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardLine: {
    position: "absolute",
    left: 40,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: colors.paperLine,
    opacity: 0.5,
  },
  cardWatched: {
    opacity: 0.7,
    backgroundColor: colors.backgroundLight,
  },
  cardContent: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
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
    color: colors.text,
  },
  titleWatched: {
    textDecorationLine: "line-through",
    color: colors.textLight,
  },
  infoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  info: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoWatched: {
    color: colors.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyCard: {
    backgroundColor: colors.paper,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    minWidth: 280,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});

export default HomeScreen;
