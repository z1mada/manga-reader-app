import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const BACKEND_URL = 'http://localhost:3000';

function FavoritePage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchFavorites();
  }, [user]);

  function fetchFavorites() {
    setLoading(true);
    fetch(`${BACKEND_URL}/favorites`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setFavorites(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Gagal fetch favorites:', err);
        setLoading(false);
      });
  }

  function handleRemove(mangaId) {
    fetch(`${BACKEND_URL}/favorites/${mangaId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then(() => {
        setFavorites(favorites.filter(fav => fav.manga_id !== mangaId));
      })
      .catch(err => console.error('Gagal hapus favorite:', err));
  }

  if (!user) {
    return (
      <div>
        <h1>Manga Favorit</h1>
        <p>
          Kamu harus <Link to="/login">login</Link> dulu buat lihat daftar favorit.
        </p>
      </div>
    );
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Manga Favorit</h1>

      {favorites.length === 0 && <p>Belum ada manga yang difavoritkan.</p>}

      <ul style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: '16px', padding: 0 }}>
        {favorites.map(fav => (
          <li key={fav.manga_id} style={{ width: '150px' }}>
            <Link to={`/manga/${fav.manga_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              {fav.cover_url && (
                <img src={fav.cover_url} alt={fav.title} style={{ width: '100%', borderRadius: '4px' }} />
              )}
              <p>{fav.title}</p>
            </Link>
            <button onClick={() => handleRemove(fav.manga_id)}>Hapus</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FavoritePage;