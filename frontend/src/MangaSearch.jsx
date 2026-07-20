import { useState } from 'react';
import { Link } from 'react-router-dom';

function getTitle(manga) {
  const titles = manga.attributes.title;
  return titles.en || Object.values(titles)[0] || 'Tanpa judul';
}

function getCoverUrl(manga) {
  const cover = manga.relationships.find(rel => rel.type === 'cover_art');
  if (!cover || !cover.attributes) return null;
  return `https://uploads.mangadex.org/covers/${manga.id}/${cover.attributes.fileName}.256.jpg`;
}

function MangaSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    fetch(`https://api.mangadex.org/manga?title=${encodeURIComponent(query)}&includes[]=cover_art`)
      .then(res => res.json())
      .then(data => {
        setResults(data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Gagal fetch manga:', err);
        setLoading(false);
      });
  }

  return (
    <div>
      <h1>Cari Manga</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Judul manga..."
        />
        <button type="submit">Cari</button>
      </form>

      {loading && <p>Loading...</p>}

      <ul style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: '16px', padding: 0 }}>
        {results.map(manga => {
          const coverUrl = getCoverUrl(manga);
          return (
            <li key={manga.id} style={{ width: '150px' }}>
              <Link to={`/manga/${manga.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {coverUrl && (
                  <img
                    src={coverUrl}
                    alt={getTitle(manga)}
                    style={{ width: '100%', borderRadius: '4px' }}
                  />
                )}
                <p>{getTitle(manga)}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default MangaSearch;