import { View, Text, Modal, Alert, StyleSheet } from "react-native";
import React, { useState, useEffect } from "react";
import { Button, TextInput } from "react-native-paper";

type Movie = {
  id: number;
  title: string;
  year: number | null;
  rating: number | null;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { title: string; year?: number; rating?: number }) => void;
  movie?: Movie | null;
};

const MovieModal = ({ visible, onClose, onSave, movie }: Props) => {
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [rating, setRating] = useState("");

  useEffect(() => {
    if (movie) {
      setTitle(movie.title);
      setYear(movie.year ? movie.year.toString() : "");
      setRating(movie.rating ? movie.rating.toString() : "");
    } else {
      setTitle("");
      setYear("");
      setRating("");
    }
  }, [movie, visible]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Lỗi validation", "Vui lòng nhập tiêu đề phim (bắt buộc)");
      return;
    }

    const currentYear = new Date().getFullYear();
    let yearNum: number | undefined;
    let ratingNum: number | undefined;

    if (year.trim()) {
      yearNum = parseInt(year);
      if (isNaN(yearNum)) {
        Alert.alert("Lỗi validation", "Năm phải là số hợp lệ");
        return;
      }
      if (yearNum < 1900) {
        Alert.alert("Lỗi validation", `Năm phải >= 1900. Bạn nhập: ${yearNum}`);
        return;
      }
      if (yearNum > currentYear) {
        Alert.alert("Lỗi validation", `Năm phải <= ${currentYear} (năm hiện tại). Bạn nhập: ${yearNum}`);
        return;
      }
    }

    if (rating.trim()) {
      ratingNum = parseInt(rating);
      if (isNaN(ratingNum)) {
        Alert.alert("Lỗi validation", "Rating phải là số hợp lệ");
        return;
      }
      if (ratingNum < 1) {
        Alert.alert("Lỗi validation", `Rating phải >= 1. Bạn nhập: ${ratingNum}`);
        return;
      }
      if (ratingNum > 5) {
        Alert.alert("Lỗi validation", `Rating phải <= 5. Bạn nhập: ${ratingNum}`);
        return;
      }
    }

    onSave({
      title: title.trim(),
      year: yearNum,
      rating: ratingNum,
    });

    setTitle("");
    setYear("");
    setRating("");
    onClose();
  };

  const handleClose = () => {
    setTitle("");
    setYear("");
    setRating("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {movie ? "Sửa phim" : "Thêm phim mới"}
          </Text>

          <TextInput
            label="Tiêu đề *"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Năm phát hành"
            value={year}
            onChangeText={setYear}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            label="Rating (1-5)"
            value={rating}
            onChangeText={setRating}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />

          <View style={styles.buttonRow}>
            <Button mode="outlined" onPress={handleClose} style={styles.button}>
              Hủy
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              disabled={!title.trim()}
              style={styles.button}
            >
              Lưu
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
  },
  button: {
    minWidth: 80,
  },
});

export default MovieModal;

