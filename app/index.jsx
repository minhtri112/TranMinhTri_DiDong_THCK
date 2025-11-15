import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  addBook,
  getAllBooks,
  initDB,
  updateBook,
  updateBookStatus,
} from "./database/db";

export default function Index() {
  const [books, setBooks] = useState([]);

  // Modal Add
  const [addModalVisible, setAddModalVisible] = useState(false);

  // Modal Edit
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  // Form inputs
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState("planning");
  const [error, setError] = useState("");

  // -------------------------------
  // Load database + data
  // -------------------------------
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

  // -------------------------------
  // Cycle status (Câu 5)
  // -------------------------------
  const cycleStatus = async (book) => {
    let next = "planning";
    if (book.status === "planning") next = "reading";
    else if (book.status === "reading") next = "done";
    else if (book.status === "done") next = "planning";

    await updateBookStatus(book.id, next);
    await loadBooks();
  };

  // -------------------------------
  // Add Book (Câu 4)
  // -------------------------------
  const handleAdd = async () => {
    if (!title.trim()) {
      setError("Tiêu đề không được để trống");
      return;
    }

    await addBook(title, author);
    setAddModalVisible(false);

    setTitle("");
    setAuthor("");
    setError("");

    await loadBooks();
  };

  // -------------------------------
  // Edit Book (Câu 6)
  // -------------------------------
  const openEdit = (book) => {
    setEditingBook(book);
    setTitle(book.title);
    setAuthor(book.author);
    setStatus(book.status);
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!title.trim()) {
      setError("Tiêu đề không được để trống");
      return;
    }

    await updateBook(editingBook.id, title, author, status);

    setEditModalVisible(false);
    setError("");

    await loadBooks();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>Danh sách sách</Text>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setAddModalVisible(true)}
        >
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* FlatList */}
      <FlatList
        data={books}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onLongPress={() => openEdit(item)}
            onPress={() => cycleStatus(item)}
            style={[
              styles.item,
              item.status === "planning"
                ? { backgroundColor: "#e3f2fd" }
                : item.status === "reading"
                ? { backgroundColor: "#fff3e0" }
                : { backgroundColor: "#e8f5e9" },
            ]}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.author}>{item.author || "Unknown"}</Text>
                <Text style={styles.status}>Status: {item.status}</Text>
              </View>

              <TouchableOpacity onPress={() => openEdit(item)}>
                <Text style={styles.editBtn}>Sửa</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* ----------------------------- */}
      {/* ADD BOOK MODAL               */}
      {/* ----------------------------- */}
      <Modal visible={addModalVisible} animationType="slide" transparent>
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
                onPress={() => setAddModalVisible(false)}
                style={[styles.btn, { backgroundColor: "#aaa" }]}
              >
                <Text style={styles.btnText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAdd}
                style={[styles.btn, { backgroundColor: "#4caf50" }]}
              >
                <Text style={styles.btnText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ----------------------------- */}
      {/* EDIT BOOK MODAL              */}
      {/* ----------------------------- */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalWrapper}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chỉnh sửa sách</Text>

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

            <Text style={{ marginTop: 10 }}>Trạng thái</Text>
            <Picker
              selectedValue={status}
              onValueChange={(v) => setStatus(v)}
              style={styles.picker}
            >
              <Picker.Item label="Planning" value="planning" />
              <Picker.Item label="Reading" value="reading" />
              <Picker.Item label="Done" value="done" />
            </Picker>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={[styles.btn, { backgroundColor: "#aaa" }]}
              >
                <Text style={styles.btnText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleUpdate}
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

/* ------------------ STYLES ------------------ */

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
  item: {
    padding: 15,
    marginBottom: 12,
    borderRadius: 10,
  },
  title: { fontSize: 18, fontWeight: "700" },
  author: { fontSize: 16, color: "#444" },
  status: { fontSize: 14, marginTop: 4 },
  editBtn: { color: "#0277bd", fontWeight: "600", fontSize: 16 },

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
  picker: {
    backgroundColor: "#f2f2f2",
    marginTop: 5,
  },
  error: { color: "red", marginBottom: 10 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop : 20 },
  btn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "600" },
});
