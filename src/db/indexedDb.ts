import { openDB } from 'idb';

const DB_NAME = 'news-reader-db';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('articles')) {
        db.createObjectStore('articles', { keyPath: 'url' });
      }
      if (!db.objectStoreNames.contains('bookmarks')) {
        db.createObjectStore('bookmarks', { keyPath: 'url' });
      }
      if (!db.objectStoreNames.contains('offlineQueue')) {
        db.createObjectStore('offlineQueue', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

export const saveArticles = async (articles: any[]) => {
  const db = await initDB();
  const tx = db.transaction('articles', 'readwrite');
  for (const article of articles) {
    await tx.store.put(article);
  }
  await tx.done;
};

export const getArticles = async () => {
  const db = await initDB();
  return db.getAll('articles');
};

export const addBookmark = async (article: any) => {
  const db = await initDB();
  await db.put('bookmarks', article);
};

export const removeBookmark = async (url: string) => {
  const db = await initDB();
  await db.delete('bookmarks', url);
};

export const getBookmarks = async () => {
  const db = await initDB();
  return db.getAll('bookmarks');
};

export const enqueueOfflineAction = async (action: any) => {
  const db = await initDB();
  await db.add('offlineQueue', action);
};

export const getOfflineActions = async () => {
  const db = await initDB();
  return db.getAll('offlineQueue');
};

export const clearOfflineQueue = async () => {
  const db = await initDB();
  await db.clear('offlineQueue');
};
