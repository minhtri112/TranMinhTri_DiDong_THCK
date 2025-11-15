import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { getAllBooks, initDB } from "./database/db";

export default function Index() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const setup = async () => {
      await initDB();
      await loadBooks();
    };
    setup();
  }, []);

  console.log("Rendering Index component", books);

  const loadBooks = async () => {
    try {
      const data = await getAllBooks();
      setBooks(data);
    } catch (error) {
      console.log("Error loading books:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Danh sách sách</Text>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 20 },
  header: { fontSize: 22, fontWeight: "600", marginBottom: 20 },
  emptyText: { textAlign: "center", marginTop: 40, color: "#777" },
  item: { backgroundColor: "#eee", padding: 15, marginBottom: 12, borderRadius: 10 },
  title: { fontSize: 18, fontWeight: "700" },
  author: { fontSize: 16, color: "#444" },
  status: { fontSize: 14, marginTop: 4 },
});
