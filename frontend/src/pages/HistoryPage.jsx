import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const BACKEND_URL = 'http://localhost:3000';

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetch(`${BACKEND_URL}/history`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Gagal fetch history:', err);
        setLoading(false);
      });
  }, [user]);

  if (!user) {
    return (
      <div>
        <h1>Riwayat Baca</h1>
        <p>
          Kamu harus <Link to="/login">login</Link> dulu buat lihat riwayat baca.
        </p>
      </div>
    );
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Riwayat Baca</h1>

      {history.length === 0 && <p>Belum ada riwayat baca.</p>}

      <ul style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: '16px', padding: 0 }}>
        {history.map(item => (
          <li key={item.manga_id} style={{ width: '150px' }}>
            <Link to={`/manga/${item.manga_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              {item.cover_url && (
                <img src={item.cover_url} alt={item.manga_title} style={{ width: '100%', borderRadius: '4px' }} />
              )}
              <p>{item.manga_title}</p>
              <p style={{ fontSize: '13px', color: '#888' }}>
                Terakhir: Chapter {item.chapter_number || '?'}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HistoryPage;