# News Reader App - PWA

A high-performance, offline-first news reader application built with React, Vite, and Workbox.

## Features
- **Offline Mode**: Fully functional offline experience using Service Workers and IndexedDB.
- **Infinite Scroll**: Progressively loads more articles as you scroll.
- **Advanced Caching**: 
  - Static Assets: Cache-First
  - API Feeds: Network-First with fallback
  - Images: Stale-While-Revalidate
- **Search**: Filter articles by keywords (works both online and offline).
- **Bookmarks**: Save articles for persistent offline reading.
- **Cache Management**: Monitor storage usage and clear cache manually.
- **Responsive Design**: Optimized for mobile and desktop.

## Tech Stack
- **Framework**: React + Vite (TypeScript)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **PWA**: Custom Service Worker + Cache API
- **Database**: IndexedDB (via `idb` library)

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/mahi63-hub/news-reader-app.git
   cd news-reader-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Optional) Add your NewsAPI.org key in a `.env` file:
   ```env
   VITE_NEWS_API_KEY=your_api_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Architecture Decisions

### 1. Caching Strategy
I implemented a multi-layered caching strategy using a custom Service Worker:
- **Cache-First**: Used for core application logic (JS, CSS, HTML) to ensure near-instant loading on subsequent visits.
- **Network-First**: Used for the news feed API calls. This ensures users always see the latest news when online, while providing a seamless fallback to cached articles when offline.
- **Stale-While-Revalidate**: Used for images and non-critical assets. This provides a fast UI response by serving cached content immediately while updating it in the background.

### 2. Data Persistence
I used **IndexedDB** as the primary storage for bookmarks and metadata. Unlike localStorage, IndexedDB can handle large amounts of structured data and is accessible from both the main thread and the Service Worker.

### 3. State Management
The `CacheProvider` (React Context) acts as a central hub for managing the global state related to network status and caching. It simplifies the implementation of indicators and ensures consistency across components.

## Screenshots
*(Add screenshots here)*

## Demo Video
*(Add link to video here)*


