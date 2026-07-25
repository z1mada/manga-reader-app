import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import SearchResults from './pages/SearchResults';
import MangaDetail from './pages/MangaDetail';
import ChapterReader from './pages/ChapterReader';
import FavoritePage from './pages/FavoritePage';
import HistoryPage from './pages/HistoryPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AllUpdatesPage from './pages/AllUpdatesPage';


function App() {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ marginLeft: '220px', width: 'calc(100% - 220px)', boxSizing: 'border-box' }}>
        <Header />
        <main style={{ marginTop: '60px', padding: '24px', overflowX: 'hidden', boxSizing: 'border-box' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/manga/:id" element={<MangaDetail />} />
            <Route path="/chapter/:chapterId" element={<ChapterReader />} />
            <Route path="/favorite" element={<FavoritePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/updates" element={<AllUpdatesPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;