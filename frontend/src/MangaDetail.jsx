import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

function MangaDetail() {
  const { id } = useParams();
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://api.mangadex.org/manga/${id}?includes[]=cover_art&includes[]=author`)
      .then(res => res.json())
      .then(data => {
        setManga(data.data);
        setLoading(false);
      })
      .catch(err => console.error('Gagal fetch detail:', err));

    fetch(`https://api.mangadex.org/manga/${id}/feed?translatedLanguage[]=en&order[chapter]=asc&limit=100`)
      .then(res => res.json())
      .then(data => {
        setChapters(data.data);
      })
      .catch(err => console.error('Gagal fetch chapter:', err));
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!manga) return <p>Manga tidak ditemukan</p>;

  const title = manga.attributes.title.en || Object.values(manga.attributes.title)[0];
  const description = manga.attributes.description.en || 'Tidak ada deskripsi.';
  const cover = manga.relationships.find(rel => rel.type === 'cover_art');
  const coverUrl = cover
    ? `https://uploads.mangadex.org/covers/${manga.id}/${cover.attributes.fileName}.512.jpg`
    : null;

  return (
    <div>
      <Link to="/">← Kembali ke search</Link>
      <h1>{title}</h1>
      {coverUrl && <img src={coverUrl} alt={title} style={{ width: '250px' }} />}
      <p>{description}</p>

      <h2>Daftar Chapter</h2>
        <ul>
            {chapters.map(ch => (
                <li key={ch.id}>
                <Link to={`/chapter/${ch.id}`}>
                    Chapter {ch.attributes.chapter || '?'} {ch.attributes.title && `- ${ch.attributes.title}`}
                </Link>
                </li>
            ))}
        </ul>
    </div>
  );
}

export default MangaDetail;