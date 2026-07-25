import { Link } from 'react-router-dom';

function Sidebar() {
  const navItems = [
    { label: 'Home', path: '/', icon: '🏠' },
    { label: 'Favorite', path: '/favorite', icon: '⭐' },
    { label: 'History', path: '/history', icon: '📖' },
    { label: 'Setting', path: '/settings', icon: '⚙️' },
  ];

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>MangaKu</div>
      <nav>
        {navItems.map(item => (
          <Link key={item.path} to={item.path} style={styles.navItem}>
            <span style={styles.icon}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '220px',
    height: '100vh',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: '20px 0',
    position: 'fixed',
    left: 0,
    top: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  logo: {
    fontSize: '20px',
    fontWeight: 'bold',
    padding: '0 20px 20px',
    borderBottom: '1px solid #333',
    marginBottom: '10px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    color: '#ccc',
    textDecoration: 'none',
    fontSize: '15px',
  },
  icon: {
    fontSize: '18px',
  },
};

export default Sidebar;