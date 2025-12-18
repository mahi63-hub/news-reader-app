import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Article } from '../types';
import * as db from '../db/indexedDb';

interface CacheContextType {
  isOnline: boolean;
  bookmarks: Article[];
  toggleBookmark: (article: Article) => Promise<void>;
  isBookmarked: (url: string) => boolean;
  clearCache: () => Promise<void>;
  cacheStats: { used: number; total: number } | null;
}

const CacheContext = createContext<CacheContextType | undefined>(undefined);

export const CacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [bookmarks, setBookmarks] = useState<Article[]>([]);
  const [cacheStats, setCacheStats] = useState<{ used: number; total: number } | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadBookmarks = useCallback(async () => {
    const stored = await db.getBookmarks();
    setBookmarks(stored);
  }, []);

  const updateCacheStats = useCallback(async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      setCacheStats({
        used: estimate.usage || 0,
        total: estimate.quota || 0,
      });
    }
  }, []);

  useEffect(() => {
    loadBookmarks();
    updateCacheStats();
  }, [loadBookmarks, updateCacheStats]);

  const toggleBookmark = async (article: Article) => {
    const bookmarked = bookmarks.some(b => b.url === article.url);
    if (bookmarked) {
      await db.removeBookmark(article.url);
    } else {
      await db.addBookmark(article);
    }
    await loadBookmarks();
  };

  const isBookmarked = (url: string) => bookmarks.some(b => b.url === url);

  const clearCache = async () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
    }
    const dbs = await window.indexedDB.databases();
    dbs.forEach(dbInfo => {
      if (dbInfo.name) window.indexedDB.deleteDatabase(dbInfo.name);
    });
    setBookmarks([]);
    await updateCacheStats();
  };

  return (
    <CacheContext.Provider value={{ isOnline, bookmarks, toggleBookmark, isBookmarked, clearCache, cacheStats }}>
      {children}
    </CacheContext.Provider>
  );
};

export const useCache = () => {
  const context = useContext(CacheContext);
  if (!context) throw new Error('useCache must be used within a CacheProvider');
  return context;
};
