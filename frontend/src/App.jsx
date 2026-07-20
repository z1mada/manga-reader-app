import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3000/todos';

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  function fetchTodos() {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setTodos(data);
        setLoading(false);
      })
      .catch(err => console.error('Gagal ambil data:', err));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!newTask.trim()) return;

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: newTask }),
    })
      .then(res => res.json())
      .then(created => {
        setTodos([...todos, created]);
        setNewTask('');
      });
  }

  function toggleDone(todo) {
    fetch(`${API_URL}/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: todo.done ? 0 : 1 }),
    })
      .then(res => res.json())
      .then(updated => {
        setTodos(todos.map(t => (t.id === updated.id ? updated : t)));
      });
  }

  function handleDelete(id) {
    fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      .then(() => {
        setTodos(todos.filter(t => t.id !== id));
      });
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Daftar Todo</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Tugas baru..."
        />
        <button type="submit">Tambah</button>
      </form>

      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <span
              onClick={() => toggleDone(todo)}
              style={{ cursor: 'pointer', textDecoration: todo.done ? 'line-through' : 'none' }}
            >
              {todo.task}
            </span>
            <button onClick={() => handleDelete(todo.id)}>Hapus</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;