import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const BACKEND_URL = 'http://localhost:3000';

function ChapterReader() {
  const { chapterId } = useParams();
  const [pages, setPages] = useState([]);
  const [externalUrl, setExternalUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    setError(null);
    setExternalUrl(null);

    fetch(`https://api.mangadex.org/chapter/${chapterId}?includes[]=manga`)
      .then(res => res.json())
      .then(data => {
        const chapterData = data.data;
        const url = chapterData.attributes.externalUrl;

        // Catat ke history kalau sudah login
        if (user) {
          const mangaRel = chapterData.relationships.find(rel => rel.type === 'manga');
          recordHistory(mangaRel?.id, chapterId, chapterData.attributes.chapter);
        }

        if (url) {
          setExternalUrl(url);
          setLoading(false);
          return;
        }

        return fetch(`https://api.mangadex.org/at-home/server/${chapterId}`)
          .then(res => {
            if (!res.ok) throw new Error('Gagal memuat halaman chapter');
            return res.json();
          })
          .then(pageData => {
            const baseUrl = pageData.baseUrl;
            const hash = pageData.chapter.hash;
            const fileNames = pageData.chapter.data;

            const imageUrls = fileNames.map(
              fileName => `${baseUrl}/data/${hash}/${fileName}`
            );

            setPages(imageUrls);
            setLoading(false);
          });
      })
      .catch(err => {
        console.error('Gagal fetch chapter:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [chapterId, user]);

  function recordHistory(mangaId, chapId, chapterNumber) {
    if (!mangaId) return;

    // Ambil info manga dulu (judul, cover) buat disimpan di history
    fetch(`https://api.mangadex.org/manga/${mangaId}?includes[]=cover_art`)
      .then(res => res.json())
      .then(data => {
        const manga = data.data;
        const title = manga.attributes.title.en || Object.values(manga.attributes.title)[0];
        const cover = manga.relationships.find(rel => rel.type === 'cover_art');
        const coverUrl = cover
          ? `https://uploads.mangadex.org/covers/${manga.id}/${cover.attributes.fileName}.256.jpg`
          : null;

        fetch(`${BACKEND_URL}/history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            manga_id: manga.id,
            manga_title: title,
            cover_url: coverUrl,
            chapter_id: chapId,
            chapter_number: chapterNumber,
          }),
        }).catch(err => console.error('Gagal simpan history:', err));
      })
      .catch(err => console.error('Gagal ambil info manga untuk history:', err));
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  if (externalUrl) {
    return (
      <div>
        <Link to="/">← Kembali ke search</Link>
        <h2>Chapter ini dilisensikan resmi</h2>
        <p>Chapter ini nggak tersedia di MangaDex, baca versi resminya di sini:</p>
        <a href={externalUrl} target="_blank" rel="noopener noreferrer">
          Baca chapter (buka di situs resmi) →
        </a>
      </div>
    );
  }

  return (
    <div>
      <Link to="/">← Kembali ke search</Link>
      <h2>Membaca chapter</h2>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {pages.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`Halaman ${index + 1}`}
            style={{ maxWidth: '100%', marginBottom: '4px' }}
          />
        ))}
      </div>
    </div>
  );
}

export default ChapterReader;