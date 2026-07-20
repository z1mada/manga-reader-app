import { Routes, Route } from 'react-router-dom';
import MangaSearch from './MangaSearch';
import MangaDetail from './MangaDetail';
import ChapterReader from './ChapterReader';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MangaSearch />} />
      <Route path="/manga/:id" element={<MangaDetail />} />
      <Route path="/chapter/:chapterId" element={<ChapterReader />} />
    </Routes>
  );
}

export default App;