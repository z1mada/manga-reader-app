import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function ChapterReader() {
  const { chapterId } = useParams();
  const [pages, setPages] = useState([]);
  const [externalUrl, setExternalUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setExternalUrl(null);

    // Cek dulu detail chapter, ada externalUrl atau nggak
    fetch(`https://api.mangadex.org/chapter/${chapterId}`)
      .then(res => res.json())
      .then(data => {
        const url = data.data.attributes.externalUrl;

        if (url) {
          // Chapter external, langsung set, nggak perlu fetch halaman
          setExternalUrl(url);
          setLoading(false);
          return;
        }

        // Chapter di-hosting MangaDex, lanjut ambil halaman
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
  }, [chapterId]);

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