import { openDatabaseSync } from "expo-sqlite";

const db = openDatabaseSync("book.db");

export const initDB = () => {
  db.transaction((tx) => {
    // Tạo bảng
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT,
        status TEXT DEFAULT 'planning',
        created_at INTEGER
      );`
    );
  });

  // Seed dữ liệu
  seedSampleData();
};

// -------------------------
// SEED SAMPLE DATA
// -------------------------
const seedSampleData = () => {
  db.transaction((tx) => {
    // Kiểm tra bảng có dữ liệu chưa
    tx.executeSql(
      "SELECT COUNT(*) as count FROM books",
      [],
      (_, result) => {
        const count = result.rows[0].count;

        if (count === 0) {
          console.log("Seeding sample books...");

          tx.executeSql(
            `INSERT INTO books (title, author, status, created_at)
             VALUES (?, ?, ?, ?);`,
            ["Clean Code", "Robert C. Martin", "planning", Date.now()]
          );

          tx.executeSql(
            `INSERT INTO books (title, author, status, created_at)
             VALUES (?, ?, ?, ?);`,
            ["Atomic Habits", "James Clear", "reading", Date.now()]
          );

          tx.executeSql(
            `INSERT INTO books (title, author, status, created_at)
             VALUES (?, ?, ?, ?);`,
            ["The Pragmatic Programmer", "Andrew Hunt", "planning", Date.now()]
          );

          console.log("Seed OK!");
        } else {
          console.log("Books already seeded — skip.");
        }
      }
    );
  });
};

export const getDb = () => db;
