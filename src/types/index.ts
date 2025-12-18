export interface Article {
  url: string;
  title: string;
  description: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
  content?: string;
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  articles: Article[];
}
