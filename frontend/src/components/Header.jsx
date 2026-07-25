import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../LanguageContext';

const LANGUAGES = [
  { code: 'id', flag: '🇮🇩', label: 'Indonesia' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'ja', flag: '🇯🇵', label: 'Japan' },
];

function Header() {
  const [query, setQuery] = useState('');
  const { user, logout } = useAuth();
  const { languages, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
  }

  function handleLogout() {
    logout().then(() => navigate('/login'));
  }

  return (
    <header style={styles.header}>
      <div style={styles.leftSection}>
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari manga..."
            style={styles.searchInput}
          />
          <button type="submit" style={styles.searchButton}>Cari</button>
        </form>

        <div style={styles.langRow}>
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => toggleLanguage(lang.code)}
              title={lang.label}
              style={{
                ...styles.langButton,
                opacity: languages.includes(lang.code) ? 1 : 0.35,
                border: languages.includes(lang.code) ? '2px solid #fff' : '2px solid transparent',
              }}
            >
              {lang.flag}
            </button>
          ))}
        </div>
      </div>

      {user ? (
        <div style={styles.userSection}>
          <span>Halo, {user.username}</span>
          <button style={styles.loginButton} onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <button style={styles.loginButton} onClick={() => navigate('/login')}>Login</button>
      )}
    </header>
  );
}

const styles = {
  header: {
    height: '60px',
    backgroundColor: '#242424',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    position: 'fixed',
    top: 0,
    left: '220px',
    right: 0,
    zIndex: 10,
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  searchForm: {
    display: 'flex',
    gap: '8px',
  },
  searchInput: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #444',
    backgroundColor: '#333',
    color: '#fff',
    width: '280px',
  },
  searchButton: {
    padding: '8px 16px',
    backgroundColor: '#333',
    color: '#fff',
    border: '1px solid #444',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  langRow: {
    display: 'flex',
    gap: '6px',
  },
  langButton: {
    fontSize: '18px',
    background: 'transparent',
    borderRadius: '6px',
    padding: '2px 6px',
    cursor: 'pointer',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#fff',
  },
  loginButton: {
    padding: '8px 20px',
    backgroundColor: '#e63946',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

export default Header;