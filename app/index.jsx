import { Picker } from "@react-native-picker/picker";
import { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useBooks } from "./hooks/useBooks";

export default function Index() {
  // Custom hook
  const {
    books,
    loading,
    importError,
    insertBook,
    editBook,
    removeBook,
    cycleStatus,
    importFromAPI,
    loadBooks,
  } = useBooks();

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [addVisible, setAddVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);

  const [editing, setEditing] = useState(null);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState("planning");
  const [error, setError] = useState("");

  // -----------------------------
  // FILTER + SEARCH
  // -----------------------------
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchText = b.title.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = statusFilter === "all" ? true : b.status === statusFilter;
      return matchText && matchStatus;
    });
  }, [books, searchText, statusFilter]);

  // -----------------------------
  // GROUP by status (SectionList)
  // -----------------------------
  const grouped = useMemo(() => {
    return [
      { title: "Planning", data: filteredBooks.filter((b) => b.status === "planning") },
      { title: "Reading", data: filteredBooks.filter((b) => b.status === "reading") },
      { title: "Done", data: filteredBooks.filter((b) => b.status === "done") },
    ].filter((s) => s.data.length > 0);
  }, [filteredBooks]);

  // -----------------------------
  // Add book
  // -----------------------------
  const handleAdd = async () => {
    if (!title.trim()) {
      setError("Tiêu đề không được để trống");
      return;
    }
    await insertBook(title, author);
    setAddVisible(false);
    setTitle("");
    setAuthor("");
    setError("");
  };

  // -----------------------------
  // Edit book
  // -----------------------------
  const openEdit = (book) => {
    setEditing(book);
    setTitle(book.title);
    setAuthor(book.author);
    setStatus(book.status);
    setEditVisible(true);
  };

  const handleUpdate = async () => {
    if (!title.trim()) {
      setError("Tiêu đề không được để trống");
      return;
    }
    await editBook(editing.id, title, author, status);
    setEditVisible(false);
    setError("");
  };

  // -----------------------------
  // Delete confirm
  // -----------------------------
  const confirmDelete = (book) => {
    Alert.alert(
      "Xóa sách",
      `Bạn có chắc muốn xóa "${book.title}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => removeBook(book.id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>Danh sách sách</Text>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity style={styles.importBtn} onPress={importFromAPI}>
            <Text style={styles.importBtnText}>Import</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.addBtn} onPress={() => setAddVisible(true)}>
            <Text style={styles.addBtnText}>+</Text>
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

      {/* Status Filter */}
      <View style={styles.filterRow}>
        {["all", "planning", "reading", "done"].map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setStatusFilter(s)}
            style={[
              styles.filterBtn,
              statusFilter === s && styles.filterBtnActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                statusFilter === s && styles.filterTextActive,
              ]}
            >
              {s.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && <Text style={styles.loadingText}>Đang nhập dữ liệu...</Text>}
      {importError !== "" && <Text style={styles.errorText}>{importError}</Text>}

      {/* EMPTY STATE */}
      {grouped.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <Text style={styles.emptyText}>Chưa có sách nào.</Text>
        </View>
      ) : (
        <SectionList
          sections={grouped}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadBooks} />
          }
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => cycleStatus(item)}
              onLongPress={() => openEdit(item)}
              style={[
                styles.item,
                item.status === "planning"
                  ? { backgroundColor: "#e3f2fd" }
                  : item.status === "reading"
                    ? { backgroundColor: "#fff3e0" }
                    : { backgroundColor: "#e8f5e9" },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                  {item.title}
                </Text>
                <Text style={styles.author}>{item.author}</Text>
                <Text>Status: {item.status}</Text>
              </View>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity onPress={() => openEdit(item)}>
                  <Text style={styles.editBtn}>Sửa</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => confirmDelete(item)}>
                  <Text style={styles.deleteBtn}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* ADD MODAL */}
      <Modal visible={addVisible} animationType="slide" transparent>
        <View style={styles.modalWrapper}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm sách mới</Text>

            <TextInput
              placeholder="Tiêu đề sách"
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
                onPress={() => setAddVisible(false)}
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
      <Modal visible={editVisible} animationType="slide" transparent>
        <View style={styles.modalWrapper}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chỉnh sửa sách</Text>

            <TextInput
              placeholder="Tiêu đề sách"
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

            <Text>Trạng thái</Text>
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
                onPress={() => setEditVisible(false)}
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

/* ===================== STYLES ===================== */

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
  addBtnText: { color: "#fff", fontSize: 26, marginTop: -4 },

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

  searchInput: {
    backgroundColor: "#f0f0f0",
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
    backgroundColor: "#ddd",
  },
  filterBtnActive: {
    backgroundColor: "#2196f3",
  },
  filterText: { color: "#333", fontWeight: "600", fontSize: 12 },
  filterTextActive: { color: "#fff" },

  sectionHeader: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 6,
  },

  item: {
    flexDirection: "row",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },

  title: { fontSize: 18, fontWeight: "700", maxWidth: 200 },
  author: { fontSize: 15, color: "#555", marginBottom: 4 },

  editBtn: { color: "#0277bd", fontWeight: "600" },
  deleteBtn: { color: "#d32f2f", fontWeight: "700" },

  emptyWrapper: {
    marginTop: 80,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#777",
  },

  modalWrapper: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 22,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
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
    marginTop: 20,
  },
  btn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  btnText: { textAlign: "center", color: "#fff", fontWeight: "600" },
});
