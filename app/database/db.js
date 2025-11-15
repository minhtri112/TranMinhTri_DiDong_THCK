import { openDatabaseSync } from "expo-sqlite";

const db = openDatabaseSync("book.db");

// ---------------------
// TẠO BẢNG
// ---------------------
export const initDB = async () => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT,
      status TEXT DEFAULT 'planning',
      created_at INTEGER
    );
  `);

  await seedSampleData();
};

// ---------------------
// SEED DATA (KHÔNG transaction)
// ---------------------
const seedSampleData = async () => {
  const rows = await db.getAllAsync("SELECT COUNT(*) as count FROM books");
  const count = rows[0].count;

  if (count === 0) {
    console.log("Seeding sample data...");

    await db.execAsync(`
      INSERT INTO books (title, author, status, created_at)
      VALUES ('Clean Code', 'Robert C. Martin', 'planning', ${Date.now()});
    `);

    await db.execAsync(`
      INSERT INTO books (title, author, status, created_at)
      VALUES ('Atomic Habits', 'James Clear', 'reading', ${Date.now()});
    `);
  }
};

// ---------------------
// HÀM LẤY TẤT CẢ SÁCH
// ---------------------
export const getAllBooks = async () => {
  return await db.getAllAsync("SELECT * FROM books ORDER BY created_at DESC");
};


export const addBook = async (title, author) => {
  const createdAt = Date.now();

  await db.runAsync(
    `INSERT INTO books (title, author, status, created_at)
     VALUES (?, ?, 'planning', ?)`,
    [title, author, createdAt]
  );
};

export const updateBookStatus = async (id, newStatus) => {
  await db.runAsync(
    `UPDATE books 
     SET status = ? 
     WHERE id = ?`,
    [newStatus, id]
  );
};

export const updateBook = async (id, title, author, status) => {
  await db.runAsync(
    `UPDATE books
     SET title = ?, author = ?, status = ?
     WHERE id = ?`,
    [title, author, status, id]
  );
};

export const deleteBook = async (id) => {
  await db.runAsync(`DELETE FROM books WHERE id = ?`, [id]);
};

export const findBookByTitle = async (title) => {
  const rows = await db.getAllAsync(
    "SELECT * FROM books WHERE LOWER(title) = LOWER(?)",
    [title]
  );
  return rows.length > 0;
};

export const getDb = () => db;
