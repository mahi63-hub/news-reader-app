import React from 'react';
import type { Article } from '../types/index';
import { useCache } from '../context/CacheContext';
import { Bookmark, BookmarkCheck, WifiOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ArticleCardProps {
  article: Article;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const { toggleBookmark, isBookmarked, isOnline } = useCache();
  const bookmarked = isBookmarked(article.url);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-slate-200 hover:border-slate-300 transition-colors">
      {article.urlToImage && (
        <img 
          src={article.urlToImage} 
          alt={article.title} 
          className="w-full h-48 object-cover bg-slate-100"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
      )}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {article.source.name}
          </span>
          <div className="flex items-center gap-2">
            {!isOnline && <WifiOff className="w-4 h-4 text-slate-400" />}
            <button 
              onClick={() => toggleBookmark(article)}
              className="text-slate-400 hover:text-primary transition-colors"
            >
              {bookmarked ? (
                <BookmarkCheck className="w-5 h-5 text-primary" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
          {article.title}
        </h3>
        <p className="text-slate-600 text-sm mb-4 line-clamp-3">
          {article.description}
        </p>
        <div className="text-xs text-slate-400">
          {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
        </div>
      </div>
    </div>
  );
};
