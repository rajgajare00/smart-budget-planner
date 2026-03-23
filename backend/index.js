const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get('/api/message', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

const transactions = [];
let nextId = 1;

app.post('/api/echo', (req, res) => {
  const { text } = req.body;
  res.json({ echo: text || 'No text sent' });
});

app.get('/api/transactions', (req, res) => {
  res.json(transactions);
});

app.post('/api/transactions', (req, res) => {
  const { amount, category, type } = req.body;
  if (typeof amount !== 'number' || !category || (type !== 'income' && type !== 'expense')) {
    return res.status(400).json({ error: 'Invalid transaction data' });
  }

  const txn = {
    id: nextId++,
    amount,
    category,
    type,
    date: new Date().toISOString(),
  };

  transactions.push(txn);
  res.status(201).json(txn);
});

app.delete('/api/transactions/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = transactions.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  transactions.splice(index, 1);
  res.json({ success: true });
});

app.get('/api/summary', (req, res) => {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const filtered = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const totalIncome = filtered.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  res.json({ month: `${year}-${String(month + 1).padStart(2, '0')}`, totalIncome, totalExpense, balance: totalIncome - totalExpense });
});

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
