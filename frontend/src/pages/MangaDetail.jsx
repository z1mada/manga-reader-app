import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../LanguageContext';

const BACKEND_URL = 'http://localhost:3000';

const LANG_LABELS = {
  id: '🇮🇩 ID',
  en: '🇬🇧 EN',
  ja: '🇯🇵 JP',
};

const RATING_LABELS = {
  safe: 'Safe',
  suggestive: 'Suggestive',
  erotica: 'Erotica',
  pornographic: 'Pornographic',
};

const STATUS_LABELS = {
  ongoing: 'Ongoing',
  completed: 'Completed',
  hiatus: 'Hiatus',
  cancelled: 'Cancelled',
};

const ORIGINAL_LANG_LABELS = {
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese',
  'zh-hk': 'Chinese (Hong Kong)',
  en: 'English',
};

const DEMOGRAPHIC_LABELS = {
  shounen: 'Shounen',
  shoujo: 'Shoujo',
  seinen: 'Seinen',
  josei: 'Josei',
};

function Modal({ title, onClose, children }) {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={styles.modalCloseButton}>✕</button>
        </div>
        <div style={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}

function MangaDetail() {
  const { id } = useParams();
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [readChapters, setReadChapters] = useState([]);
  const [sortOrder, setSortOrder] = useState('asc');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDescModal, setShowDescModal] = useState(false);
  const [isDescTruncated, setIsDescTruncated] = useState(false);
  const descRef = useRef(null);
  const { user } = useAuth();
  const { languages } = useLanguage();

  useEffect(() => {
    fetch(`https://api.mangadex.org/manga/${id}?includes[]=cover_art&includes[]=author&includes[]=artist`)
      .then(res => res.json())
      .then(data => {
        setManga(data.data);
        setLoading(false);
      })
      .catch(err => console.error('Gagal fetch detail:', err));

    if (user) {
      fetch(`${BACKEND_URL}/favorites`, { credentials: 'include' })
        .then(res => res.json())
        .then(favorites => {
          const found = favorites.some(fav => fav.manga_id === id);
          setIsFavorite(found);
        })
        .catch(err => console.error('Gagal cek favorite:', err));

      fetch(`${BACKEND_URL}/history/manga/${id}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => setReadChapters(data))
        .catch(err => console.error('Gagal fetch read chapters:', err));
    }
  }, [id, user]);

  useEffect(() => {
    const langQuery = languages.length > 0
      ? languages.map(l => `translatedLanguage[]=${l}`).join('&')
      : 'translatedLanguage[]=en';

    fetch(`https://api.mangadex.org/manga/${id}/feed?${langQuery}&order[chapter]=${sortOrder}&limit=100`)
      .then(res => res.json())
      .then(data => setChapters(data.data))
      .catch(err => console.error('Gagal fetch chapter:', err));
  }, [id, languages, sortOrder]);

  useEffect(() => {
    if (descRef.current) {
      const el = descRef.current;
      setIsDescTruncated(el.scrollHeight > el.clientHeight);
    }
  }, [manga]);

  function toggleFavorite() {
    if (!user) {
      alert('Kamu harus login dulu untuk menambah favorite');
      return;
    }

    if (isFavorite) {
      fetch(`${BACKEND_URL}/favorites/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
        .then(() => setIsFavorite(false))
        .catch(err => console.error('Gagal hapus favorite:', err));
    } else {
      const title = manga.attributes.title.en || Object.values(manga.attributes.title)[0];
      const cover = manga.relationships.find(rel => rel.type === 'cover_art');
      const coverUrl = cover
        ? `https://uploads.mangadex.org/covers/${manga.id}/${cover.attributes.fileName}.256.jpg`
        : null;

      fetch(`${BACKEND_URL}/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ manga_id: id, title, cover_url: coverUrl }),
      })
        .then(res => res.json())
        .then(() => setIsFavorite(true))
        .catch(err => console.error('Gagal tambah favorite:', err));
    }
  }

  if (loading) return <p>Loading...</p>;
  if (!manga) return <p>Manga tidak ditemukan</p>;

  const title = manga.attributes.title.en || Object.values(manga.attributes.title)[0];
  const altTitleEn = Object.values(manga.attributes.title)[0] !== title
    ? null
    : (manga.attributes.altTitles || [])
        .map(t => t.en)
        .filter(Boolean)[0];
  const description = manga.attributes.description.en || 'Tidak ada deskripsi.';

  const cover = manga.relationships.find(rel => rel.type === 'cover_art');
  const coverUrl = cover
    ? `https://uploads.mangadex.org/covers/${manga.id}/${cover.attributes.fileName}.512.jpg`
    : null;
  const genres = (manga.attributes.tags || [])
    .filter(tag => tag.attributes.group === 'genre')
    .map(tag => tag.attributes.name.en)
    .filter(Boolean);

  const year = manga.attributes.year;
  const rating = RATING_LABELS[manga.attributes.contentRating] || manga.attributes.contentRating;
  const status = STATUS_LABELS[manga.attributes.status] || manga.attributes.status;
  const originalLanguageLabel = ORIGINAL_LANG_LABELS[manga.attributes.originalLanguage] || manga.attributes.originalLanguage;
  const demographic = DEMOGRAPHIC_LABELS[manga.attributes.publicationDemographic] || manga.attributes.publicationDemographic;

  const authors = manga.relationships
    .filter(rel => rel.type === 'author')
    .map(rel => rel.attributes?.name)
    .filter(Boolean);
  const artists = manga.relationships
    .filter(rel => rel.type === 'artist')
    .map(rel => rel.attributes?.name)
    .filter(Boolean);

  return (
    <div style={styles.page}>
      <Link to="/" style={styles.backLink}>← Kembali</Link>

      <div style={styles.headerSection}>
        <div style={styles.sidebar}>
          {coverUrl && <img src={coverUrl} alt={title} style={styles.cover} />}

          <button
            onClick={toggleFavorite}
            style={{
              ...styles.favoriteButton,
              ...(isFavorite ? styles.favoriteButtonActive : {}),
            }}
          >
            {isFavorite ? '★ Favorit' : '☆ Tambah ke Favorite'}
          </button>

          {genres.length > 0 && (
            <div style={styles.genreRow}>
              {genres.map(genre => (
                <span key={genre} style={styles.genreBadge}>{genre}</span>
              ))}
            </div>
          )}
        </div>

        <div style={styles.mainInfo}>
          <h1 style={styles.title}>{title}</h1>
          {altTitleEn && <p style={styles.altTitle}>{altTitleEn}</p>}

          <div style={styles.descriptionWrapper}>
            <p ref={descRef} style={styles.description}>
              {description}
            </p>
            {isDescTruncated && (
              <button onClick={() => setShowDescModal(true)} style={styles.seeMoreButton}>
                Selengkapnya
              </button>
            )}
          </div>

          <button onClick={() => setShowDetailModal(true)} style={styles.detailButton}>
            Lihat Detail
          </button>
        </div>
      </div>

      <div style={styles.chapterHeader}>
        <h2 style={styles.sectionTitle}>Daftar Chapter</h2>
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          style={styles.sortButton}
        >
          {sortOrder === 'asc' ? 'Terlama ↑' : 'Terbaru ↓'}
        </button>
      </div>

      <div style={styles.chapterList}>
        {chapters.map(ch => {
          const isRead = readChapters.includes(ch.id);
          const langLabel = LANG_LABELS[ch.attributes.translatedLanguage] || ch.attributes.translatedLanguage;

          return (
            <Link
              key={ch.id}
              to={`/chapter/${ch.id}`}
              style={{
                ...styles.chapterRow,
                opacity: isRead ? 0.45 : 1,
              }}
            >
              <span style={styles.chapterName}>
                Chapter {ch.attributes.chapter || '?'}
                {ch.attributes.title && (
                  <span style={styles.chapterSubtitle}> — {ch.attributes.title}</span>
                )}
              </span>

              <span style={styles.chapterMeta}>
                {isRead && <span style={styles.readBadge}>Sudah dibaca</span>}
                <span style={styles.langBadge}>{langLabel}</span>
              </span>
            </Link>
          );
        })}
      </div>

      {showDetailModal && (
        <Modal title="Detail Manga" onClose={() => setShowDetailModal(false)}>
          <div style={styles.modalGrid}>
            {year && (
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Tahun</span>
                <span style={styles.detailValue}>{year}</span>
              </div>
            )}
            {rating && (
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Rating</span>
                <span style={styles.detailValue}>{rating}</span>
              </div>
            )}
            {status && (
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Status</span>
                <span style={styles.detailValue}>{status}</span>
              </div>
            )}
            {originalLanguageLabel && (
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Bahasa Asli</span>
                <span style={styles.detailValue}>{originalLanguageLabel}</span>
              </div>
            )}
            {demographic && (
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Demografi</span>
                <span style={styles.detailValue}>{demographic}</span>
              </div>
            )}
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Total Chapter</span>
              <span style={styles.detailValue}>{chapters.length}</span>
            </div>
            {authors.length > 0 && (
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Author</span>
                <span style={styles.detailValue}>{authors.join(', ')}</span>
              </div>
            )}
            {artists.length > 0 && (
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Artist</span>
                <span style={styles.detailValue}>{artists.join(', ')}</span>
              </div>
            )}
          </div>
        </Modal>
      )}

      {showDescModal && (
        <Modal title={title} onClose={() => setShowDescModal(false)}>
          <p style={styles.modalDescription}>{description}</p>
        </Modal>
      )}
    </div>
  );
}

const styles = {
  page: {
    maxWidth: '900px',
  },
  backLink: {
    display: 'inline-block',
    marginBottom: '20px',
    color: '#4dabf7',
    textDecoration: 'none',
    fontSize: '14px',
  },
  headerSection: {
    display: 'flex',
    gap: '24px',
    marginBottom: '32px',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flexShrink: 0,
    width: '220px',
  },
  cover: {
    width: '220px',
    height: '310px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  favoriteButton: {
    padding: '10px 16px',
    fontSize: '13px',
    border: '1px solid #444',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    color: '#eee',
    cursor: 'pointer',
    width: '100%',
  },
  favoriteButtonActive: {
    backgroundColor: '#e6394622',
    borderColor: '#e63946',
    color: '#ff8a94',
  },
  genreRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    paddingTop: '4px',
    borderTop: '1px solid #2a2a2a',
  },
  genreBadge: {
    fontSize: '11px',
    padding: '4px 10px',
    borderRadius: '999px',
    backgroundColor: 'transparent',
    border: '1px solid #444',
    color: '#ccc',
  },
  mainInfo: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  title: {
    fontSize: '26px',
    lineHeight: 1.3,
    margin: 0,
  },
  altTitle: {
    fontSize: '14px',
    color: '#888',
    margin: '4px 0 16px 0',
  },
  descriptionWrapper: {
    position: 'relative',
  },
  description: {
    fontSize: '14px',
    lineHeight: 1.6,
    color: '#bbb',
    margin: 0,
    textAlign: 'justify',
    maxHeight: '148px',
    overflow: 'hidden',
  },
  seeMoreButton: {
    display: 'block',
    marginTop: '6px',
    background: 'none',
    border: 'none',
    color: '#4dabf7',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
    padding: 0,
  },
  detailButton: {
    alignSelf: 'flex-start',
    marginTop: '20px',
    fontSize: '13px',
    padding: '8px 16px',
    border: '1px solid #444',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    color: '#eee',
    cursor: 'pointer',
  },
  chapterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '24px',
    marginBottom: '12px',
  },
  sectionTitle: {
    margin: 0,
  },
  sortButton: {
    fontSize: '13px',
    padding: '6px 14px',
    border: '1px solid #444',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    color: '#eee',
    cursor: 'pointer',
  },
  chapterList: {
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #333',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  chapterRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    textDecoration: 'none',
    color: '#eee',
    borderBottom: '1px solid #2a2a2a',
    backgroundColor: '#1c1c1c',
  },
  chapterName: {
    fontSize: '14px',
  },
  chapterSubtitle: {
    color: '#999',
  },
  chapterMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  readBadge: {
    fontSize: '11px',
    color: '#999',
  },
  langBadge: {
    fontSize: '11px',
    fontWeight: 'bold',
    padding: '3px 8px',
    borderRadius: '999px',
    backgroundColor: '#333',
    color: '#ccc',
    whiteSpace: 'nowrap',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  modalBox: {
    backgroundColor: '#1c1c1c',
    borderRadius: '10px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '80vh',
    overflowY: 'auto',
    border: '1px solid #333',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #2a2a2a',
    position: 'sticky',
    top: 0,
    backgroundColor: '#1c1c1c',
  },
  modalCloseButton: {
    background: 'none',
    border: 'none',
    color: '#999',
    fontSize: '18px',
    cursor: 'pointer',
  },
  modalBody: {
    padding: '20px',
  },
  modalGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  modalDescription: {
    fontSize: '14px',
    lineHeight: 1.7,
    color: '#ccc',
    textAlign: 'justify',
    margin: 0,
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  detailLabel: {
    fontSize: '11px',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  detailValue: {
    fontSize: '14px',
    color: '#eee',
  },
};

export default MangaDetail;