require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const todosRouter = require('./routes/todos.js');
const favoritesRouter = require('./routes/favorites.js');
const authRouter = require('./routes/auth.js');
const historyRouter = require('./routes/history.js');


const app = express();
const PORT = 3000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Halo, server jalan!');
});

app.use('/todos', todosRouter);
app.use('/favorites', favoritesRouter);
app.use('/auth', authRouter);
app.use('/history', historyRouter);

app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});