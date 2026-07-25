import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../LanguageContext';
import { timeAgo } from '../utils';

const BACKEND_URL = 'http://localhost:3000';

function getTitle(manga) {
  const titles = manga.attributes.title;
  return titles.en || Object.values(titles)[0] || 'Tanpa judul';
}

function getCoverUrl(manga) {
  const cover = manga.relationships.find(rel => rel.type === 'cover_art');
  if (!cover || !cover.attributes) return null;
  return `https://uploads.mangadex.org/covers/${manga.id}/${cover.attributes.fileName}.256.jpg`;
}

function fetchLatestChapterFeed(langs, limit = 100) {
  const langQuery = langs.map(l => `translatedLanguage[]=${l}`).join('&');
  return fetch(
    `https://api.mangadex.org/chapter?${langQuery}&order[readableAt]=desc&limit=${limit}&includes[]=manga`
  )
    .then(res => res.json())
    .then(data => data.data);
}

function fetchLatestChaptersForManga(mangaId, langs) {
  const langQuery = langs.map(l => `translatedLanguage[]=${l}`).join('&');
  return fetch(
    `https://api.mangadex.org/manga/${mangaId}/feed?${langQuery}&order[readableAt]=desc&limit=3`
  )
    .then(res => res.json())
    .then(data => data.data);
}

function HomePage() {
  const [tab, setTab] = useState('all');
  const [mangaList, setMangaList] = useState([]);
  const [chaptersByManga, setChaptersByManga] = useState({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { languages } = useLanguage();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (languages.length === 0) {
      setMangaList([]);
      setChaptersByManga({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setChaptersByManga({});

    if (tab === 'all') {
      loadAllUpdates(languages)
        .then(({ mangaList, chaptersByManga }) => {
          setMangaList(mangaList);
          setChaptersByManga(chaptersByManga);
          setLoading(false);
        })
        .catch(err => console.error('Gagal fetch homepage:', err));
    } else {
      loadFavoriteUpdates(languages)
        .then(({ mangaList, chaptersByManga }) => {
          setMangaList(mangaList);
          setChaptersByManga(chaptersByManga);
          setLoading(false);
        })
        .catch(err => console.error('Gagal fetch homepage:', err));
    }
  }, [tab, user, languages]);

  function loadAllUpdates(langs) {
    return fetchLatestChapterFeed(langs, 100).then(chapters => {
      const chapterMap = {};
      const orderedMangaIds = [];

      chapters.forEach(ch => {
        const mangaRel = ch.relationships.find(rel => rel.type === 'manga');
        if (!mangaRel) return;
        const mangaId = mangaRel.id;

        if (!chapterMap[mangaId]) {
          chapterMap[mangaId] = [];
          orderedMangaIds.push(mangaId);
        }
        if (chapterMap[mangaId].length < 3) {
          chapterMap[mangaId].push(ch);
        }
      });

      const topIds = orderedMangaIds.slice(0, 10);
      if (topIds.length === 0) {
        return { mangaList: [], chaptersByManga: {} };
      }

      const idsQuery = topIds.map(id => `ids[]=${id}`).join('&');
      return fetch(`https://api.mangadex.org/manga?${idsQuery}&includes[]=cover_art`)
        .then(res => res.json())
        .then(mangaData => {
          const mangaById = {};
          mangaData.data.forEach(m => { mangaById[m.id] = m; });

          const orderedManga = topIds.map(id => mangaById[id]).filter(Boolean);
          const chaptersByManga = {};
          topIds.forEach(id => { chaptersByManga[id] = chapterMap[id]; });

          return { mangaList: orderedManga, chaptersByManga };
        });
    });
  }

  function loadFavoriteUpdates(langs) {
    if (!user) return Promise.resolve({ mangaList: [], chaptersByManga: {} });

    return fetch(`${BACKEND_URL}/favorites`, { credentials: 'include' })
      .then(res => res.json())
      .then(favorites => {
        if (favorites.length === 0) return { mangaList: [], chaptersByManga: {} };

        const idsQuery = favorites.map(fav => `ids[]=${fav.manga_id}`).join('&');
        return fetch(`https://api.mangadex.org/manga?${idsQuery}&includes[]=cover_art`)
          .then(res => res.json())
          .then(mangaData => mangaData.data)
          .then(list =>
            Promise.all(
              list.map(manga =>
                fetchLatestChaptersForManga(manga.id, langs).then(chs => ({ manga, chs }))
              )
            )
          )
          .then(results => {
            const chaptersByManga = {};
            const withChapters = [];

            results.forEach(r => {
              chaptersByManga[r.manga.id] = r.chs;
              if (r.chs.length > 0) withChapters.push(r.manga);
            });

            withChapters.sort((a, b) => {
              const dateA = new Date(chaptersByManga[a.id][0].attributes.readableAt);
              const dateB = new Date(chaptersByManga[b.id][0].attributes.readableAt);
              return dateB - dateA;
            });

            return { mangaList: withChapters, chaptersByManga };
          });
      });
  }

  function scroll(direction) {
    if (!scrollRef.current) return;
    const amount = 600;
    scrollRef.current.scrollBy({ left: direction * amount, behavior: 'smooth' });
  }

  return (
    <div>
      <h1>Update Terbaru</h1>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setTab('all')} style={{ fontWeight: tab === 'all' ? 'bold' : 'normal' }}>
            Semua
          </button>
          <button onClick={() => setTab('favorites')} style={{ fontWeight: tab === 'favorites' ? 'bold' : 'normal' }}>
            Favorit Saya
          </button>
        </div>

        {tab === 'all' && (
          <Link to="/updates" style={{ fontSize: '14px', color: '#4dabf7' }}>
            Lihat Semua →
          </Link>
        )}
      </div>

      {loading && <p>Loading...</p>}

      {!loading && languages.length === 0 && (
        <p>Pilih minimal satu bahasa dulu (di header).</p>
      )}

      {!loading && tab === 'favorites' && !user && (
        <p>Login dulu buat lihat update dari manga favoritmu.</p>
      )}

      {!loading && languages.length > 0 && mangaList.length === 0 && (tab === 'all' || user) && (
        <p>Tidak ada update untuk ditampilkan.</p>
      )}

      {!loading && mangaList.length > 0 && (
        <div style={styles.wrapper}>
          <button onClick={() => scroll(-1)} style={styles.arrowLeft}>‹</button>
          <button onClick={() => scroll(1)} style={styles.arrowRight}>›</button>

          <div ref={scrollRef} style={styles.scrollContainer}>
            {mangaList.map(manga => {
              const coverUrl = getCoverUrl(manga);
              const chapters = chaptersByManga[manga.id] || [];

              return (
                <div key={manga.id} style={styles.card}>
                  <Link to={`/manga/${manga.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {coverUrl && <img src={coverUrl} alt={getTitle(manga)} style={styles.cover} />}
                    <p style={styles.title}>{getTitle(manga)}</p>
                  </Link>

                  {chapters.map(ch => (
                    <Link key={ch.id} to={`/chapter/${ch.id}`} style={styles.chapterLine}>
                      <span>Ch. {ch.attributes.chapter || '?'}</span>
                      <span style={styles.chapterTime}>{timeAgo(ch.attributes.readableAt)}</span>
                    </Link>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    position: 'relative',
    width: '100%',
    minWidth: 0,
    overflow: 'hidden',
  },
  scrollContainer: {
    display: 'flex',
    gap: '16px',
    overflowX: 'hidden',
    scrollBehavior: 'smooth',
    minWidth: 0,
  },
  card: {
    flexShrink: 0,
    width: '150px',
  },
  cover: {
    width: '100%',
    height: '210px',
    objectFit: 'cover',
    borderRadius: '4px',
  },
  title: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginTop: '4px',
    marginBottom: '4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chapterLine: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#aaa',
    textDecoration: 'none',
  },
  chapterTime: {
    color: '#666',
    whiteSpace: 'nowrap',
  },
  arrowLeft: {
    position: 'absolute',
    left: '4px',
    top: '90px',
    zIndex: 5,
    background: 'rgba(0,0,0,0.7)',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    fontSize: '18px',
  },
  arrowRight: {
    position: 'absolute',
    right: '4px',
    top: '90px',
    zIndex: 5,
    background: 'rgba(0,0,0,0.7)',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    fontSize: '18px',
  },
};

export default HomePage;