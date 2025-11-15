import { Picker } from "@react-native-picker/picker";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import {
  addBook,
  deleteBook,
  findBookByTitle,
  getAllBooks,
  initDB,
  updateBook,
  updateBookStatus
} from "./database/db";

export default function Index() {
  const [books, setBooks] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(false);
  const [importError, setImportError] = useState("");

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const [editingBook, setEditingBook] = useState(null);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState("planning");
  const [error, setError] = useState("");

  // ------------------------------------
  // LOAD DATA
  // ------------------------------------
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

  // ------------------------------------
  // CYCLE STATUS
  // ------------------------------------
  const cycleStatus = async (book) => {
    let next = "planning";
    if (book.status === "planning") next = "reading";
    else if (book.status === "reading") next = "done";
    else if (book.status === "done") next = "planning";

    await updateBookStatus(book.id, next);
    await loadBooks();
  };

  // ------------------------------------
  // ADD BOOK
  // ------------------------------------
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

  // ------------------------------------
  // EDIT BOOK
  // ------------------------------------
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

  // ------------------------------------
  // DELETE BOOK
  // ------------------------------------
  const confirmDelete = (book) => {
    Alert.alert(
      "Xóa sách",
      `Bạn có chắc muốn xóa "${book.title}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            await deleteBook(book.id);
            await loadBooks();
          },
        },
      ]
    );
  };

  // ------------------------------------
  // SEARCH + FILTER
  // ------------------------------------
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchSearch = book.title.toLowerCase().includes(searchText.toLowerCase());

      const matchStatus =
        statusFilter === "all" ? true : book.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [books, searchText, statusFilter]);

  // ------------------------------------
  // IMPORT API
  // ------------------------------------
  const importFromAPI = async () => {
    try {
      setLoading(true);
      setImportError("");

      const res = await fetch("https://gutendex.com/books/");
      const json = await res.json();

      // Chuẩn: map title + author
      const data = json.results.map((item) => ({
        title: item.title,
        author: item.authors?.[0]?.name || "Unknown",
        status: "planning",
      }));

      // merge tránh trùng title
      for (const book of data) {
        const exists = await findBookByTitle(book.title);
        if (!exists) {
          await addBook(book.title, book.author);
        }
      }

      await loadBooks();
    } catch (err) {
      setImportError("Lỗi khi nhập dữ liệu từ API.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------
  // UI
  // ------------------------------------
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>Danh sách sách</Text>

        <View style={{ flexDirection: "row", gap: 10 }}>


          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setAddModalVisible(true)}
          >
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.importBtn} onPress={importFromAPI}>
            <Text style={styles.importBtnText}>Import</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <TextInput
        placeholder="Tìm kiếm theo tiêu đề..."
        value={searchText}
        onChangeText={setSearchText}
        style={styles.searchInput}
      />
      {loading && <Text style={styles.loadingText}>Đang nhập dữ liệu...</Text>}
      {importError !== "" && <Text style={styles.errorText}>{importError}</Text>}

      {/* Filter */}
      <View style={styles.filterRow}>
        {["all", "planning", "reading", "done"].map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setStatusFilter(s)}
            style={[
              styles.filterBtn,
              statusFilter === s ? styles.filterBtnActive : null,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                statusFilter === s ? styles.filterTextActive : null,
              ]}
            >
              {s.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LIST */}
      <FlatList
        data={filteredBooks}
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
                <View style={{ flex: 1, paddingRight: 20 }}>
                  <Text
                    style={styles.title}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.title}
                  </Text>

                  <Text
                    style={styles.author}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.author || "Unknown"}
                  </Text>

                  <Text style={styles.status}>Status: {item.status}</Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity onPress={() => openEdit(item)}>
                  <Text style={styles.editBtn}>Sửa</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => confirmDelete(item)}>
                  <Text style={styles.deleteBtn}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* ADD MODAL */}
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

      {/* EDIT MODAL */}
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

  importBtn: {
    backgroundColor: "#8BC34A",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },

  importBtnText: {
    color: "#fff",
    fontWeight: "700",
  },

  loadingText: {
    color: "#1976d2",
    marginBottom: 6,
  },

  errorText: {
    color: "red",
    marginBottom: 6,
  },

  item: {
    padding: 15,
    marginBottom: 12,
    borderRadius: 10,
  },

  title: { fontSize: 18, fontWeight: "700" },
  author: { fontSize: 16, color: "#444" },
  status: { fontSize: 14, marginTop: 4 },

  editBtn: {
    color: "#0277bd",
    fontWeight: "600",
    fontSize: 16,
  },

  deleteBtn: {
    color: "#d32f2f",
    fontWeight: "700",
    fontSize: 16,
  },

  searchInput: {
    backgroundColor: "#f1f1f1",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: "#e0e0e0",
  },

  filterBtnActive: {
    backgroundColor: "#2196f3",
  },

  filterText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 12,
  },

  filterTextActive: {
    color: "#fff",
  },

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

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  btn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },

  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});
