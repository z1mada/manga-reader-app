import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { timeAgo } from '../utils';
import { useLanguage } from '../LanguageContext';

const PER_PAGE = 50;

function getTitle(manga) {
  const titles = manga.attributes.title;
  return titles.en || Object.values(titles)[0] || 'Tanpa judul';
}

function getCoverUrl(manga) {
  const cover = manga.relationships.find(rel => rel.type === 'cover_art');
  if (!cover || !cover.attributes) return null;
  return `https://uploads.mangadex.org/covers/${manga.id}/${cover.attributes.fileName}.256.jpg`;
}

function AllUpdatesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const { languages } = useLanguage();

  const [items, setItems] = useState([]); // [{ manga, chapter }]
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (languages.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const offset = (page - 1) * PER_PAGE;
    const langQuery = languages.map(l => `translatedLanguage[]=${l}`).join('&');

    fetch(
      `https://api.mangadex.org/chapter?${langQuery}&order[readableAt]=desc&limit=${PER_PAGE}&offset=${offset}&includes[]=manga`
    )
      .then(res => res.json())
      .then(data => {
        setTotalPages(Math.max(1, Math.ceil(data.total / PER_PAGE)));

        // Dedupe: 1 manga cuma tampil 1x per halaman, ambil chapter TERBARUnya
        // (chapter list ini sudah urut readableAt desc dari server)
        const seen = new Set();
        const uniqueChapters = [];
        data.data.forEach(ch => {
          const mangaRel = ch.relationships.find(rel => rel.type === 'manga');
          if (!mangaRel || seen.has(mangaRel.id)) return;
          seen.add(mangaRel.id);
          uniqueChapters.push({ chapter: ch, mangaId: mangaRel.id });
        });

        const idsQuery = uniqueChapters.map(u => `ids[]=${u.mangaId}`).join('&');
        if (!idsQuery) return { items: [] };

        return fetch(`https://api.mangadex.org/manga?${idsQuery}&includes[]=cover_art`)
          .then(res => res.json())
          .then(mangaData => {
            const mangaById = {};
            mangaData.data.forEach(m => { mangaById[m.id] = m; });

            const items = uniqueChapters
              .map(u => ({ manga: mangaById[u.mangaId], chapter: u.chapter }))
              .filter(item => item.manga);

            return { items };
          });
      })
      .then(result => {
        if (result) setItems(result.items);
        setLoading(false);
      })
      .catch(err => {
        console.error('Gagal fetch semua update:', err);
        setLoading(false);
      });
  }, [page, languages]);

  function goToPage(p) {
    setSearchParams({ page: p });
    window.scrollTo(0, 0);
  }

  function getPageNumbers() {
    const pages = [];
    const maxShown = 5;
    let start = Math.max(1, page - Math.floor(maxShown / 2));
    let end = Math.min(totalPages, start + maxShown - 1);
    start = Math.max(1, end - maxShown + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  return (
    <div>
      <h1>Semua Update Terbaru</h1>

      {loading && <p>Loading...</p>}

      {!loading && languages.length === 0 && <p>Pilih minimal satu bahasa dulu (di header).</p>}

      {!loading && languages.length > 0 && (
        <>
          <div style={styles.grid}>
            {items.map(({ manga, chapter }) => {
              const coverUrl = getCoverUrl(manga);
              return (
                <div key={manga.id} style={styles.card}>
                  <Link to={`/manga/${manga.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {coverUrl && <img src={coverUrl} alt={getTitle(manga)} style={styles.cover} />}
                    <p style={styles.title}>{getTitle(manga)}</p>
                  </Link>

                  <Link to={`/chapter/${chapter.id}`} style={styles.chapterLine}>
                    <span>Ch. {chapter.attributes.chapter || '?'}</span>
                    <span style={styles.chapterTime}>{timeAgo(chapter.attributes.readableAt)}</span>
                  </Link>
                </div>
              );
            })}
          </div>

          <Pagination page={page} totalPages={totalPages} onGo={goToPage} pageNumbers={getPageNumbers()} />
        </>
      )}
    </div>
  );
}

function Pagination({ page, totalPages, onGo, pageNumbers }) {
  return (
    <div style={styles.pagination}>
      <button disabled={page === 1} onClick={() => onGo(page - 1)} style={styles.pageButton}>Prev</button>

      {pageNumbers[0] > 1 && (
        <>
          <button onClick={() => onGo(1)} style={styles.pageButton}>1</button>
          <span>...</span>
        </>
      )}

      {pageNumbers.map(p => (
        <button
          key={p}
          onClick={() => onGo(p)}
          style={{
            ...styles.pageButton,
            fontWeight: p === page ? 'bold' : 'normal',
            backgroundColor: p === page ? '#444' : 'transparent',
          }}
        >
          {p}
        </button>
      ))}

      {pageNumbers[pageNumbers.length - 1] < totalPages && (
        <>
          <span>...</span>
          <button onClick={() => onGo(totalPages)} style={styles.pageButton}>{totalPages}</button>
        </>
      )}

      <button disabled={page === totalPages} onClick={() => onGo(page + 1)} style={styles.pageButton}>Next</button>
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '20px',
    margin: '20px 0',
  },
  card: { width: '100%' },
  cover: { width: '100%', height: '210px', objectFit: 'cover', borderRadius: '4px' },
  title: {
    fontSize: '14px', fontWeight: 'bold', marginTop: '4px', marginBottom: '4px',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  chapterLine: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#aaa', textDecoration: 'none' },
  chapterTime: { color: '#666', whiteSpace: 'nowrap' },
  pagination: { display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center', margin: '20px 0' },
  pageButton: { padding: '6px 12px', border: '1px solid #444', borderRadius: '6px', background: 'transparent', color: '#fff', cursor: 'pointer' },
};

export default AllUpdatesPage;