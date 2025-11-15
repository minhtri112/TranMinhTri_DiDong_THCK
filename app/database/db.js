import { openDatabaseSync } from "expo-sqlite";

const db = openDatabaseSync('book.db');

export const initDB = () => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT,
        status TEXT DEFAULT 'planning',
        created_at INTEGER
      );`,
      [],
      () => console.log("Table created successfully!"),
      (_, error) => {
        console.log("Error creating table: ", error);
        return false;
      }
    );
  });
};


export const getDb = () => db;