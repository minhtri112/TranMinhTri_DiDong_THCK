import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { addBook, getAllBooks, initDB } from "./database/db";

export default function Index() {
  const [books, setBooks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const setup = async () => {
      await initDB();
      await loadBooks();
    };
    setup();
  }, []);

  const loadBooks = async () => {
    const data = await getAllBooks();
    setBooks(data);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Tiêu đề không được để trống");
      return;
    }

    await addBook(title, author);
    setModalVisible(false);

    // Reset form
    setTitle("");
    setAuthor("");
    setError("");

    await loadBooks();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>Danh sách sách</Text>

        {/* Nút + */}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Empty */}
      {books.length === 0 ? (
        <Text style={styles.emptyText}>Chưa có sách trong danh sách đọc.</Text>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.author}>{item.author || "Unknown"}</Text>
              <Text style={styles.status}>Status: {item.status}</Text>
            </View>
          )}
        />
      )}

      {/* Modal thêm sách */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalWrapper}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm sách mới</Text>

            <TextInput
              placeholder="Tiêu đề sách *"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />

            <TextInput
              placeholder="Tác giả"
              value={author}
              onChangeText={setAuthor}
              style={styles.input}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.btn, { backgroundColor: "#aaa" }]}
              >
                <Text style={styles.btnText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSave}
                style={[styles.btn, { backgroundColor: "#4caf50" }]}
              >
                <Text style={styles.btnText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, paddingHorizontal: 20 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  header: { fontSize: 22, fontWeight: "600" },
  addBtn: {
    backgroundColor: "#2196f3",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  addBtnText: { fontSize: 26, color: "#fff", marginTop: -4 },
  emptyText: { textAlign: "center", marginTop: 40, color: "#777" },
  item: {
    backgroundColor: "#eee",
    padding: 15,
    marginBottom: 12,
    borderRadius: 10,
  },
  title: { fontSize: 18, fontWeight: "700" },
  author: { fontSize: 16, color: "#444" },
  status: { fontSize: 14, marginTop: 4 },

  // Modal style
  modalWrapper: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  input: {
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  error: { color: "red", marginBottom: 10 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  btn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "600" },
});