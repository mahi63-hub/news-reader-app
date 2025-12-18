import type { NewsResponse, Article } from '../types/index';

const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';

const MOCK_ARTICLES: Article[] = [
  {
    url: 'https://example.com/1',
    title: 'Advanced Client-Side Caching Techniques',
    description: 'Learn how to build high-performance PWAs using Service Workers and IndexedDB.',
    urlToImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
    publishedAt: new Date().toISOString(),
    source: { name: 'Tech News' },
  },
  {
    url: 'https://example.com/2',
    title: 'Offline-First Development with React',
    description: 'A comprehensive guide to building reliable web applications that work without internet.',
    urlToImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
    publishedAt: new Date().toISOString(),
    source: { name: 'Dev Journal' },
  },
  {
    url: 'https://example.com/3',
    title: 'The Future of PWAs in 2025',
    description: 'Exploring upcoming features and best practices for progressive web apps.',
    urlToImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
    publishedAt: new Date().toISOString(),
    source: { name: 'Web Monthly' },
  },
];

export const fetchTopHeadlines = async (page = 1, pageSize = 10, query = ''): Promise<NewsResponse> => {
  if (!API_KEY) {
    console.warn('No NewsAPI key found, using mock data.');
    await new Promise(resolve => setTimeout(resolve, 500));
    const filtered = MOCK_ARTICLES.filter(a => 
      a.title.toLowerCase().includes(query.toLowerCase()) || 
      a.description.toLowerCase().includes(query.toLowerCase())
    );
    return {
      status: 'ok',
      totalResults: filtered.length,
      articles: filtered,
    };
  }

  const endpoint = query 
    ? `${BASE_URL}/everything?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}&apiKey=${API_KEY}`
    : `${BASE_URL}/top-headlines?country=us&page=${page}&pageSize=${pageSize}&apiKey=${API_KEY}`;

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error('Failed to fetch news');
  }
  return response.json();
};
