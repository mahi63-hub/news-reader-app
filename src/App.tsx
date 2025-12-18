import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchTopHeadlines } from './api/news';
import type { Article } from './types/index';
import { ArticleCard } from './components/ArticleCard';
import { useCache } from './context/CacheContext';
import { Search, Wifi, WifiOff, Database, Trash2, RefreshCcw } from 'lucide-react';
import * as db from './db/indexedDb';

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const { isOnline, clearCache, cacheStats, bookmarks } = useCache();
  const [view, setView] = useState<'feed' | 'bookmarks'>('feed');
  
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && isOnline && view === 'feed') {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, isOnline, view]);

  const loadArticles = useCallback(async (pageNum: number, search: string, refresh = false) => {
    setLoading(true);
    try {
      if (isOnline) {
        const data = await fetchTopHeadlines(pageNum, 10, search);
        setArticles(prev => refresh ? data.articles : [...prev, ...data.articles]);
        setHasMore(data.articles.length > 0);
        await db.saveArticles(data.articles);
      } else {
        const cached = await db.getArticles();
        setArticles(cached.filter(a => 
          a.title.toLowerCase().includes(search.toLowerCase()) ||
          a.description.toLowerCase().includes(search.toLowerCase())
        ));
        setHasMore(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  useEffect(() => {
    if (view === 'feed') {
      loadArticles(page, query);
    }
  }, [page, view, loadArticles, query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadArticles(1, query, true);
  };

  const handleRefresh = () => {
    setPage(1);
    loadArticles(1, query, true);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-primary tracking-tighter uppercase">NewsReader</h1>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
          
          <form onSubmit={handleSearch} className="flex-1 max-w-md relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search news..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </form>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setView(view === 'feed' ? 'bookmarks' : 'feed')}
              className="text-sm font-medium text-slate-600 hover:text-primary"
            >
              {view === 'feed' ? 'Bookmarks' : 'Back to Feed'}
            </button>
            <div className="group relative">
              <Database className="w-5 h-5 text-slate-400 cursor-pointer hover:text-primary transition-colors" />
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <h4 className="text-sm font-bold mb-2">Storage Statistics</h4>
                {cacheStats && (
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Used</span>
                      <span className="font-medium">{formatSize(cacheStats.used)}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full" 
                        style={{ width: `${(cacheStats.used / cacheStats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                <button 
                  onClick={clearCache}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Clear Cache
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {view === 'feed' ? 'Latest News' : 'Your Bookmarks'}
          </h2>
          {view === 'feed' && isOnline && (
            <button 
              onClick={handleRefresh}
              className="p-2 text-slate-400 hover:text-primary hover:bg-white rounded-lg transition-all"
            >
              <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(view === 'feed' ? articles : bookmarks).map((article, idx) => (
            <div key={`${article.url}-${idx}`} ref={idx === articles.length - 1 ? lastElementRef : null}>
              <ArticleCard article={article} />
            </div>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center mt-12">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {!loading && (view === 'feed' ? articles : bookmarks).length === 0 && (
          <div className="text-center py-24">
            <p className="text-slate-400 font-medium">No articles found.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
