import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

function getTitle(manga) {
  const titles = manga.attributes.title;
  return titles.en || Object.values(titles)[0] || 'Tanpa judul';
}

function getCoverUrl(manga) {
  const cover = manga.relationships.find(rel => rel.type === 'cover_art');
  if (!cover || !cover.attributes) return null;
  return `https://uploads.mangadex.org/covers/${manga.id}/${cover.attributes.fileName}.256.jpg`;
}

function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;

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
  }, [query]);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Hasil pencarian: "{query}"</h1>

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

export default SearchResults;