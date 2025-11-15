import { View, Text, Modal, StyleSheet, Keyboard } from "react-native";
import React, { useState } from "react";
import { Button, TextInput, ActivityIndicator } from "react-native-paper";

type Props = {
  visible: boolean;
  onClose: () => void;
  onImport: (apiUrl: string) => Promise<void>;
};

const ImportAPIModal = ({ visible, onClose, onImport }: Props) => {
  const [apiUrl, setApiUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    if (!apiUrl.trim()) {
      setError("Vui lòng nhập API URL");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onImport(apiUrl.trim());
      setApiUrl("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Không thể import phim từ API");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setApiUrl("");
    setError(null);
    Keyboard.dismiss();
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
          <Text style={styles.modalTitle}>Import từ API</Text>

          <TextInput
            label="API URL"
            value={apiUrl}
            onChangeText={(text) => {
              setApiUrl(text);
              setError(null);
            }}
            mode="outlined"
            style={styles.input}
            placeholder="https://example.com/api/movies"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" />
              <Text style={styles.loadingText}>Đang import...</Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            <Button
              mode="outlined"
              onPress={handleClose}
              style={styles.button}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              mode="contained"
              onPress={handleImport}
              style={styles.button}
              disabled={loading || !apiUrl.trim()}
            >
              Import
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
    backgroundColor: "white",
  },
  errorText: {
    color: "#f44336",
    fontSize: 14,
    marginBottom: 12,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
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

export default ImportAPIModal;

