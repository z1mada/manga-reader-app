const express = require('express');
const cors = require('cors');
const todosRouter = require('./routes/todos.js');

const app = express();
const PORT = 3000;

app.use(cors()); // <- tambahin ini
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Halo, server jalan!');
});

app.use('/todos', todosRouter);

app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});