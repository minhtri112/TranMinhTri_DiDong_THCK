import { useCallback, useEffect, useState } from "react";
import {
    addBook,
    deleteBook,
    findBookByTitle,
    getAllBooks,
    initDB,
    updateBook,
    updateBookStatus
} from "../database/db";

export function useBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importError, setImportError] = useState("");

  // ------------------------------------
  // LOAD BOOKS
  // ------------------------------------
  const loadBooks = useCallback(async () => {
    const data = await getAllBooks();
    setBooks(data);
  }, []);

  useEffect(() => {
    (async () => {
      await initDB();
      await loadBooks();
    })();
  }, [loadBooks]);

  // ------------------------------------
  // ADD
  // ------------------------------------
  const insertBook = useCallback(async (title, author) => {
    await addBook(title, author);
    await loadBooks();
  }, [loadBooks]);

  // ------------------------------------
  // UPDATE
  // ------------------------------------
  const editBook = useCallback(async (id, title, author, status) => {
    await updateBook(id, title, author, status);
    await loadBooks();
  }, [loadBooks]);

  // ------------------------------------
  // DELETE
  // ------------------------------------
  const removeBook = useCallback(async (id) => {
    await deleteBook(id);
    await loadBooks();
  }, [loadBooks]);

  // ------------------------------------
  // CYCLE STATUS
  // ------------------------------------
  const cycleStatus = useCallback(async (book) => {
    let next = "planning";
    if (book.status === "planning") next = "reading";
    else if (book.status === "reading") next = "done";
    else next = "planning";

    await updateBookStatus(book.id, next);
    await loadBooks();
  }, [loadBooks]);

  // ------------------------------------
  // IMPORT API
  // ------------------------------------
  const importFromAPI = useCallback(async () => {
    try {
      setLoading(true);
      setImportError("");

      const res = await fetch("https://gutendex.com/books/");
      const json = await res.json();

      const data = json.results.map((item) => ({
        title: item.title,
        author: item.authors?.[0]?.name || "Unknown",
      }));

      for (const book of data) {
        const exists = await findBookByTitle(book.title);
        if (!exists) await addBook(book.title, book.author);
      }

      await loadBooks();
    } catch (e) {
      setImportError("Lỗi khi import API");
    } finally {
      setLoading(false);
    }
  }, [loadBooks]);

  return {
    books,
    loading,
    importError,
    loadBooks,
    insertBook,
    editBook,
    removeBook,
    cycleStatus,
    importFromAPI,
  };
}