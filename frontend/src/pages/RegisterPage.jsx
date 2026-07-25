import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    register(username, password)
      .then(() => {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 1000);
      })
      .catch(err => setError(err.message));
  }

  return (
    <div>
      <h1>Daftar Akun</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit">Daftar</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>Berhasil daftar! Mengarahkan ke login...</p>}

      <p>
        Sudah punya akun? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default RegisterPage;